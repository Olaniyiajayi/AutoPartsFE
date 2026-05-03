import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_NAME = 'records';

export const dbService = {
  async saveRecord<T extends { pk: string, sk: string }>(record: T) {
    try {
      const docId = `${record.pk}##${record.sk}`;
      await setDoc(doc(db, COLLECTION_NAME, docId), record);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${record.pk}##${record.sk}`);
    }
  },

  async getRecordsByPK<T>(pk: string): Promise<T[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('pk', '==', pk)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as T);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async getRecordsByPKAndSKPrefix<T>(pk: string, skPrefix: string): Promise<T[]> {
    try {
      // In Firestore, prefix matching can be done using >= prefix and < prefix + '\uf8ff'
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('pk', '==', pk),
        where('sk', '>=', skPrefix),
        where('sk', '<=', skPrefix + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as T);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async deleteRecord(pk: string, sk: string) {
    try {
      const docId = `${pk}##${sk}`;
      await deleteDoc(doc(db, COLLECTION_NAME, docId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${pk}##${sk}`);
    }
  },

  subscribeToRecords<T>(pk: string, skPrefix: string, callback: (records: T[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('pk', '==', pk),
      where('sk', '>=', skPrefix),
      where('sk', '<=', skPrefix + '\uf8ff')
    );
    
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as T));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    });
  },

  subscribeToSingleRecord<T>(pk: string, sk: string, callback: (record: T | null) => void) {
    const docId = `${pk}##${sk}`;
    return onSnapshot(doc(db, COLLECTION_NAME, docId), (docSnap) => {
      callback(docSnap.exists() ? docSnap.data() as T : null);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${docId}`);
    });
  },

  async getNextCounter(pk: string, sk: string): Promise<number> {
    const docId = `${pk}##${sk}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    
    try {
      return await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(docRef);
        let nextValue = 1;
        
        if (docSnap.exists()) {
          nextValue = (docSnap.data().value || 0) + 1;
          transaction.update(docRef, { value: nextValue });
        } else {
          transaction.set(docRef, { 
            pk, 
            sk, 
            type: 'counter', 
            value: 1 
          });
        }
        
        return nextValue;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${docId}`);
      return 0;
    }
  }
};

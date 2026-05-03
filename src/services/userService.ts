import { dbService } from '../lib/db';
import { AppUser } from '../types';
import { OperationType, handleFirestoreError } from '../lib/db';

export const userService = {
  async saveUser(user: Omit<AppUser, 'pk' | 'sk' | 'type'>): Promise<void> {
    const pk = `TENANT#${user.tenantId}`;
    const sk = `USER#${user.id}`;
    await dbService.saveRecord({
      ...user,
      pk,
      sk,
      type: 'user'
    } as AppUser);
  },

  async getUser(tenantId: string, userId: string): Promise<AppUser | null> {
    const pk = `TENANT#${tenantId}`;
    const sk = `USER#${userId}`;
    let record: AppUser | null = null;
    await new Promise<void>((resolve) => {
      const unsub = dbService.subscribeToSingleRecord<AppUser>(pk, sk, (data) => {
        record = data;
        unsub();
        resolve();
      });
    });
    return record;
  }
};

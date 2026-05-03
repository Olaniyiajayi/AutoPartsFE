import { Customer } from '../types';
import { dbService } from '../lib/db';

export const customerService = {
  async getCustomers(tenantId: string): Promise<Customer[]> {
    return dbService.getRecordsByPKAndSKPrefix<Customer>(`TENANT#${tenantId}`, 'CUSTOMER#');
  },

  async saveCustomer(customer: Omit<Customer, 'pk' | 'sk' | 'type'>): Promise<void> {
    const pk = `TENANT#${customer.tenantId}`;
    const sk = `CUSTOMER#${customer.id}`;
    await dbService.saveRecord({
      ...customer,
      pk,
      sk,
      type: 'customer'
    } as Customer);
  },

  async deleteCustomer(tenantId: string, id: string): Promise<void> {
    await dbService.deleteRecord(`TENANT#${tenantId}`, `CUSTOMER#${id}`);
  },

  subscribeToCustomers(tenantId: string, callback: (customers: Customer[]) => void) {
    return dbService.subscribeToRecords<Customer>(`TENANT#${tenantId}`, 'CUSTOMER#', callback);
  }
};

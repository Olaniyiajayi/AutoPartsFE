import { Invoice } from '../types';
import { dbService } from '../lib/db';

export const invoiceService = {
  async getInvoices(tenantId: string): Promise<Invoice[]> {
    return dbService.getRecordsByPKAndSKPrefix<Invoice>(`TENANT#${tenantId}`, 'INVOICE#');
  },

  async saveInvoice(invoice: Omit<Invoice, 'pk' | 'sk' | 'type'>): Promise<void> {
    const pk = `TENANT#${invoice.tenantId}`;
    const sk = `INVOICE#${invoice.id}`;
    await dbService.saveRecord({
      ...invoice,
      pk,
      sk,
      type: 'invoice'
    } as Invoice);
  },

  async deleteInvoice(tenantId: string, id: string): Promise<void> {
    await dbService.deleteRecord(`TENANT#${tenantId}`, `INVOICE#${id}`);
  },

  subscribeToInvoices(tenantId: string, callback: (invoices: Invoice[]) => void) {
    return dbService.subscribeToRecords<Invoice>(`TENANT#${tenantId}`, 'INVOICE#', callback);
  }
};

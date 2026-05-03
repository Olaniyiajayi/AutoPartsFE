import { AutoPart, InventoryStats } from '../types';
import { dbService } from '../lib/db';

export const inventoryService = {
  async getParts(tenantId: string): Promise<AutoPart[]> {
    return dbService.getRecordsByPKAndSKPrefix<AutoPart>(`TENANT#${tenantId}`, 'PART#');
  },

  async savePart(part: Omit<AutoPart, 'pk' | 'sk' | 'type'>): Promise<void> {
    const pk = `TENANT#${part.tenantId}`;
    const sk = `PART#${part.id}`;
    await dbService.saveRecord({
      ...part,
      pk,
      sk,
      type: 'part',
      lastUpdated: new Date().toISOString()
    } as AutoPart);
  },

  async deletePart(tenantId: string, id: string): Promise<void> {
    await dbService.deleteRecord(`TENANT#${tenantId}`, `PART#${id}`);
  },

  getStats(parts: AutoPart[]): InventoryStats {
    return {
      totalItems: parts.length,
      totalValue: parts.reduce((acc, p) => acc + (p.price * p.quantity), 0),
      lowStockItems: parts.filter(p => p.quantity > 0 && p.quantity <= p.minStockLevel).length,
      outOfStockItems: parts.filter(p => p.quantity === 0).length,
    };
  },

  subscribeToParts(tenantId: string, callback: (parts: AutoPart[]) => void) {
    return dbService.subscribeToRecords<AutoPart>(`TENANT#${tenantId}`, 'PART#', callback);
  },

  async generateNextSKU(tenantId: string): Promise<string> {
    const nextValue = await dbService.getNextCounter(`TENANT#${tenantId}`, 'COUNTER#PART');
    const paddedValue = nextValue.toString().padStart(5, '0');
    return `PART-${paddedValue}`;
  }
};

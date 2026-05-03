import { Tenant } from '../types';
import { dbService } from '../lib/db';

export const tenantService = {
  async getTenant(id: string): Promise<Tenant | null> {
    const pk = `TENANT#${id}`;
    const sk = 'TENANT_DETAILS';
    let record: Tenant | null = null;
    await new Promise<void>((resolve) => {
      const unsub = dbService.subscribeToSingleRecord<Tenant>(pk, sk, (data) => {
        record = data;
        unsub();
        resolve();
      });
    });
    return record;
  },

  async saveTenant(tenant: Omit<Tenant, 'pk' | 'sk' | 'type'>): Promise<void> {
    const pk = `TENANT#${tenant.id}`;
    const sk = 'TENANT_DETAILS';
    await dbService.saveRecord({
      ...tenant,
      pk,
      sk,
      type: 'tenant'
    } as Tenant);
  },

  async addCustomCategory(tenantId: string, category: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    if (tenant) {
      const customCategories = tenant.customCategories || [];
      if (!customCategories.includes(category)) {
        await this.saveTenant({
          ...tenant,
          customCategories: [...customCategories, category]
        });
      }
    }
  },

  subscribeToTenant(id: string, callback: (tenant: Tenant | null) => void) {
    const pk = `TENANT#${id}`;
    const sk = 'TENANT_DETAILS';
    return dbService.subscribeToSingleRecord<Tenant>(pk, sk, callback);
  }
};

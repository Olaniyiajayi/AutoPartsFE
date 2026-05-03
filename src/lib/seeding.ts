import { inventoryService } from '../services/inventoryService';
import { customerService } from '../services/customerService';
import { invoiceService } from '../services/invoiceService';
import { tenantService } from '../services/tenantService';
import { userService } from '../services/userService';
import { AutoPart, Customer, Invoice, Tenant, AppUser } from '../types';

export const seedDemoTenant = async () => {
  const tid = '1';
  console.log('Seeding demo tenant 1...');
  
  // 0. Seed Super Admin User (Note: This is just the DB record, Auth is separate)
  const superAdmin: Omit<AppUser, 'pk' | 'sk' | 'type'> = {
    id: 'demo-admin-uid', // In a real scenario this matches Auth UID
    tenantId: tid,
    email: 'admin@autofix.ng',
    name: 'Master Admin',
    role: 'SuperAdmin',
    createdAt: new Date().toISOString()
  };
  await userService.saveUser(superAdmin);

  // 1. Seed Tenant Details
  const tenant: Omit<Tenant, 'pk' | 'sk' | 'type'> = {
    id: tid,
    name: 'AutoFix Master Workshop',
    location: 'Victoria Island, Lagos',
    email: 'admin@autofix.ng',
    phone: '+234 801 234 5678',
    currencySymbol: '₦',
    customCategories: ['Engine Oil', 'Body Kits']
  };
  await tenantService.saveTenant(tenant);

  // 2. Seed Customers
  const customers: Omit<Customer, 'pk' | 'sk' | 'type'>[] = [
    {
      id: 'cust-1',
      tenantId: tid,
      name: 'Emeka Obi',
      phone: '08033001122',
      email: 'emeka@example.com',
      address: 'Lekki Phase 1, Lagos',
      totalSpent: 150000,
      lastVisit: new Date().toISOString()
    },
    {
      id: 'cust-2',
      tenantId: tid,
      name: 'Sade Adebayo',
      phone: '08122334455',
      email: 'sade@gmail.com',
      address: 'Ikeja, Lagos',
      totalSpent: 45000,
      lastVisit: new Date().toISOString()
    }
  ];
  for (const c of customers) {
    await customerService.saveCustomer(c);
  }

  // 3. Seed Parts
  const parts: Omit<AutoPart, 'pk' | 'sk' | 'type'>[] = [
    {
      id: 'part-1',
      tenantId: tid,
      name: 'Toyota Camry Brake Pads (Front)',
      sku: 'TY-BP-CF-001',
      category: 'Brakes',
      brand: 'Toyota Genuine',
      compatibleModels: ['Camry 2012-2018', 'Avalon 2013+'],
      price: 18500,
      costPriceUSD: 12,
      quantity: 15,
      minStockLevel: 5,
      location: 'Shelf A1',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'part-2',
      tenantId: tid,
      name: 'Honda Accord Shock Absorber',
      sku: 'HD-SA-RR-002',
      category: 'Suspension',
      brand: 'KYB',
      compatibleModels: ['Accord 2008-2012'],
      price: 42000,
      costPriceUSD: 28,
      quantity: 4,
      minStockLevel: 2,
      location: 'Floor Rack 3',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'part-3',
      tenantId: tid,
      name: 'Synthetic Engine Oil 5W-30',
      sku: 'MOB-SO-001',
      category: 'Engine',
      brand: 'Mobil 1',
      compatibleModels: ['Universal'],
      price: 35000,
      costPriceUSD: 23,
      quantity: 24,
      minStockLevel: 6,
      location: 'Oil Cabin',
      lastUpdated: new Date().toISOString()
    }
  ];
  for (const p of parts) {
    await inventoryService.savePart(p);
  }

  // 4. Seed Invoices
  const invoices: Omit<Invoice, 'pk' | 'sk' | 'type'>[] = [
    {
      id: 'inv-1',
      tenantId: tid,
      invoiceNumber: 'INV-1001',
      customerId: 'cust-1',
      customerName: 'Emeka Obi',
      items: [
        { partId: 'part-1', name: 'Toyota Camry Brake Pads (Front)', quantity: 1, unitPrice: 18500, totalPrice: 18500 }
      ],
      subtotal: 18500,
      tax: 0,
      total: 18500,
      paymentMethod: 'Transfer',
      status: 'Paid',
      createdAt: new Date().toISOString()
    },
    {
      id: 'inv-2',
      tenantId: tid,
      invoiceNumber: 'INV-1002',
      customerId: 'cust-2',
      customerName: 'Sade Adebayo',
      items: [
        { partId: 'part-3', name: 'Synthetic Engine Oil 5W-30', quantity: 1, unitPrice: 35000, totalPrice: 35000 }
      ],
      subtotal: 35000,
      tax: 0,
      total: 35000,
      paymentMethod: 'Cash',
      status: 'Pending',
      createdAt: new Date().toISOString()
    }
  ];
  for (const i of invoices) {
    await invoiceService.saveInvoice(i);
  }
  
  console.log('Demo tenant 1 seeded successfully.');
};

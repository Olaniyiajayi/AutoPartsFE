export type PartCategory = 
  | 'Engine' 
  | 'Transmission' 
  | 'Suspension' 
  | 'Brakes' 
  | 'Electrical' 
  | 'Body' 
  | 'Interior' 
  | 'Cooling' 
  | 'Lighting' 
  | 'Other';

export interface BaseRecord {
  pk: string;
  sk: string;
  type: string;
}

export interface AutoPart extends BaseRecord {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  series?: string;
  compatibleModels: string[];
  price: number;
  costPriceUSD?: number;
  quantity: number;
  minStockLevel: number;
  location: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  lastUpdated: string;
}

export type PaymentMethod = 'Cash' | 'Online' | 'Transfer';
export type InvoiceStatus = 'Paid' | 'Pending' | 'Cancelled';

export interface Tenant extends BaseRecord {
  id: string;
  name: string;
  location: string;
  logo?: string;
  phone?: string;
  email?: string;
  currencySymbol?: string;
  customCategories?: string[];
}

export interface Customer extends BaseRecord {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  lastVisit: string;
}

export interface AppUser extends BaseRecord {
  id: string;
  tenantId: string;
  email: string;
  role: 'SuperAdmin' | 'Admin' | 'Technician';
  name: string;
  createdAt: string;
}

export interface InvoiceItem {
  partId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice extends BaseRecord {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  createdAt: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

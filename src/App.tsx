import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  TrendingUp, 
  AlertCircle, 
  Layers, 
  Sparkles,
  ChevronRight,
  Menu,
  Bell,
  Settings,
  HelpCircle,
  Truck,
  ArrowRight,
  Share2,
  DollarSign,
  RefreshCw,
  Users,
  Receipt,
  Store,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AutoPart, InventoryStats, Customer, Invoice, Tenant } from './types';
import { inventoryService } from './services/inventoryService';
import { customerService } from './services/customerService';
import { invoiceService } from './services/invoiceService';
import { tenantService } from './services/tenantService';
import { StatCard } from './components/StatCard';
import { InventoryTable } from './components/InventoryTable';
import { PartForm } from './components/PartForm';
import { CustomerList } from './components/CustomerList';
import { CustomerForm } from './components/CustomerForm';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceView } from './components/InvoiceView';
import { LoginPage } from './components/LoginPage';
import { TenantSettings } from './components/TenantSettings';
import { formatNaira, cn } from './lib/utils';

import { useAuth } from './components/FirebaseProvider';

export default function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [currentTenantId, setCurrentTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);
  const [parts, setParts] = useState<AutoPart[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ 
    totalItems: 0, 
    totalValue: 0, 
    lowStockItems: 0, 
    outOfStockItems: 0 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState<string>('all');
  const [filterPriceRange, setFilterPriceRange] = useState<{min: number, max: number}>({ min: 0, max: 10000000 });
  const [filterModel, setFilterModel] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<AutoPart | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'customers' | 'invoices' | 'settings'>('dashboard');

  // Sync currentTenantId with user.uid or '1' for demo
  useEffect(() => {
    if (user && !currentTenantId) {
      const tid = user.email === 'admin@autofix.ng' ? '1' : user.uid;
      setCurrentTenantId(tid);
      // Initialize tenant if it doesn't exist
      tenantService.getTenant(tid).then(async (tenant) => {
        if (!tenant) {
          if (tid === '1') {
            const { seedDemoTenant } = await import('./lib/seeding');
            await seedDemoTenant();
          } else {
            const newTenant: Tenant = {
              id: tid,
              pk: `TENANT#${tid}`,
              sk: 'TENANT_DETAILS',
              type: 'tenant',
              name: user.displayName || 'Authorized Mechanic Workshop',
              location: 'Lagos, Nigeria',
              email: user.email || '',
              currencySymbol: '₦'
            };
            await tenantService.saveTenant(newTenant);

            // Create Super Admin record for this new tenant
            const { userService } = await import('./services/userService');
            await userService.saveUser({
              id: user.uid,
              tenantId: tid,
              email: user.email || '',
              name: user.displayName || 'Super Admin',
              role: 'SuperAdmin',
              createdAt: new Date().toISOString()
            });
          }
        }
      });
    }
  }, [user, currentTenantId]);

  const currentTenant = useMemo(() => 
    tenants.find(t => t.id === currentTenantId) || { id: currentTenantId, pk: `TENANT#${currentTenantId}`, sk: 'TENANT_DETAILS', type: 'tenant', name: 'Loading...', location: '', currencySymbol: '₦' },
    [currentTenantId, tenants]
  );

  useEffect(() => {
    if (user && currentTenantId) {
      const unsubTenant = tenantService.subscribeToTenant(currentTenantId, (t) => {
        if (t) setTenants([t]);
      });
      const unsubParts = inventoryService.subscribeToParts(currentTenantId, setParts);
      const unsubCustomers = customerService.subscribeToCustomers(currentTenantId, setCustomers);
      const unsubInvoices = invoiceService.subscribeToInvoices(currentTenantId, setInvoices);

      return () => {
        unsubTenant();
        unsubParts();
        unsubCustomers();
        unsubInvoices();
      };
    }
  }, [user, currentTenantId]);

  useEffect(() => {
    setStats(inventoryService.getStats(parts));
  }, [parts]);

  const handleSavePart = async (part: Omit<AutoPart, 'pk' | 'sk' | 'type'>) => {
    if (!currentTenantId) {
      throw new Error('Tenant ID not found. Please log in again.');
    }
    await inventoryService.savePart({ ...part, tenantId: currentTenantId });
    setIsFormOpen(false);
    setEditingPart(null);
  };

  const handleDeletePart = async (id: string) => {
    if (confirm('Are you sure you want to delete this part from inventory?')) {
      await inventoryService.deletePart(currentTenantId, id);
    }
  };

  const handleSaveCustomer = async (customer: Customer) => {
    await customerService.saveCustomer({ ...customer, tenantId: currentTenantId });
    setIsCustomerFormOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm('Are you sure? This will remove the customer from the directory.')) {
      await customerService.deleteCustomer(currentTenantId, id);
    }
  };

  const handleSaveInvoice = async (invoice: Invoice) => {
    await invoiceService.saveInvoice({ ...invoice, tenantId: currentTenantId });
    
    // Decrement stock
    for (const item of invoice.items) {
      const part = parts.find(p => p.id === item.partId);
      if (part) {
        await inventoryService.savePart({
          ...part,
          quantity: Math.max(0, part.quantity - item.quantity)
        });
      }
    }

    // Update customer stats
    const customer = customers.find(c => c.id === invoice.customerId);
    if (customer) {
      await customerService.saveCustomer({
        ...customer,
        totalSpent: (customer.totalSpent || 0) + invoice.total,
        lastVisit: new Date().toISOString()
      });
    }

    setIsInvoiceFormOpen(false);
  };

  const handleUpdateTenant = async (tenant: Tenant) => {
    await tenantService.saveTenant(tenant);
    alert('Branch profile updated successfully.');
  };

  const handleAddCustomCategory = async (category: string) => {
    await tenantService.addCustomCategory(currentTenantId, category);
  };

  const shareToWhatsApp = (part: AutoPart) => {
    const text = `*New Auto Part Available!*%0A%0A*Name:* ${part.name}%0A*Brand:* ${part.brand}%0A*Price:* ${formatNaira(part.price)}%0A*Compatibility:* ${part.compatibleModels.join(', ')}%0A%0A_Powered by AutoFix Naija_`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareInvoiceWhatsApp = (invoice: Invoice, customer: Customer) => {
    const itemsText = invoice.items.map(item => `- ${item.name} (${item.quantity}px) @ ${formatNaira(item.unitPrice)}`).join('%0A');
    const text = `*Invoice from ${currentTenant.name}*%0A%0A*Inv %23:* ${invoice.invoiceNumber}%0A*Customer:* ${customer.name}%0A%0A*Items:*%0A${itemsText}%0A%0A*Total:* ${formatNaira(invoice.total)}%0A%0A_Status: ${invoice.status}_%0A%0AThank you for your business!`;
    const phone = customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const shareInvoiceEmail = (invoice: Invoice, customer: Customer) => {
    const itemsText = invoice.items.map(item => `- ${item.name} (${item.quantity}x) @ ${formatNaira(item.unitPrice)}`).join('\n');
    const subject = `Invoice ${invoice.invoiceNumber} from ${currentTenant.name}`;
    const body = `Hello ${customer.name},\n\nHere are the details for your invoice ${invoice.invoiceNumber}:\n\nTotal: ${formatNaira(invoice.total)}\n\nItems:\n${itemsText}\n\nThank you for choosing ${currentTenant.name}!`;
    window.open(`mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const bulkUpdateFX = async (newRate: number) => {
    const margin = 1.3; // 30% margin
    const partsToUpdate = parts.filter(p => p.costPriceUSD);
    
    for (const p of partsToUpdate) {
      await inventoryService.savePart({ 
        ...p, 
        price: Math.ceil((p.costPriceUSD! * newRate * margin) / 500) * 500 
      });
    }
    alert(`Inventory prices updated based on ₦${newRate}/$ rate.`);
  };

  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !filterCategory || p.category === filterCategory;
      const matchesBrand = !filterBrand || p.brand === filterBrand;
      
      const matchesStockStatus = 
        filterStockStatus === 'all' ? true :
        filterStockStatus === 'in-stock' ? p.quantity > 5 :
        filterStockStatus === 'low-stock' ? (p.quantity > 0 && p.quantity <= 5) :
        filterStockStatus === 'out-of-stock' ? p.quantity === 0 : true;

      const matchesPrice = p.price >= filterPriceRange.min && p.price <= filterPriceRange.max;
      const matchesModel = !filterModel || p.compatibleModels.some(m => m.toLowerCase().includes(filterModel.toLowerCase()));
      
      return matchesSearch && matchesCategory && matchesBrand && matchesStockStatus && matchesPrice && matchesModel;
    });
  }, [parts, searchQuery, filterCategory, filterBrand, filterStockStatus, filterPriceRange, filterModel]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(i => 
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, searchQuery]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Syncing Workshop Data...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pattern-bg">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8">
          <div className="relative mb-10">
            <button 
              onClick={() => setIsStoreSwitcherOpen(!isStoreSwitcherOpen)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                  <Store className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentTenant.name.split(' ')[0]}</p>
                  <h3 className="text-xs font-black text-slate-900 tracking-tight">{currentTenant.location.split(',')[0]}</h3>
                </div>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform", isStoreSwitcherOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isStoreSwitcherOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                >
                  {tenants.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => {
                        setCurrentTenantId(t.id);
                        setIsStoreSwitcherOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                        currentTenantId === t.id ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-500"
                      )}
                    >
                      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black", currentTenantId === t.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400")}>
                        {t.name[0]}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest truncate">{t.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-naija-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 rotate-3">
              <Truck className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter text-slate-900">AutoFix</h1>
              <p className="text-[10px] uppercase font-black text-emerald-600 tracking-[0.3em] -mt-1 opacity-80">Naija Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Operations Center</p>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm border-2",
              activeTab === 'dashboard' ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            <TrendingUp className="w-5 h-5" />
            Executive Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('inventory')}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm border-2",
              activeTab === 'inventory' ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            <Package className="w-5 h-5" />
            Live Inventory
          </button>
          
          <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pt-4 mb-4">Core Ledger</p>
          <button 
            onClick={() => setActiveTab('invoices')}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm border-2",
              activeTab === 'invoices' ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            <Receipt className="w-5 h-5" />
            Sales Hub (Invoices)
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm border-2",
              activeTab === 'customers' ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            <Users className="w-5 h-5" />
            Customer Directory
          </button>

          <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pt-4 mb-4">Branch Control</p>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm border-2",
              activeTab === 'settings' ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            <Settings className="w-5 h-5" />
            Store Settings
          </button>
          
          <div className="pt-6 mt-4 border-t border-slate-50">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm focus:outline-none"
            >
              <LogOut className="w-5 h-5" />
              Sign Out System
            </button>
          </div>
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex -space-x-2 mb-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <h4 className="font-black text-lg leading-tight mb-2 italic">Part Guru AI</h4>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-6">Expert Assistant</p>
              <button className="flex items-center gap-2 text-xs font-black bg-emerald-600 px-4 py-2.5 rounded-full hover:bg-emerald-500 transition-all">
                TRY THE GURU <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <Sparkles className="absolute -bottom-8 -right-8 w-32 h-32 text-white/5 opacity-40 rotate-12" />
          </div>
        </div>

        <div className="p-6 border-t border-slate-50 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-900 border-4 border-white shadow-md flex items-center justify-center font-black text-white text-xs overflow-hidden">
            {user?.photoURL ? <img src={user.photoURL} alt="User" /> : user?.displayName?.[0] || 'A'}
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-slate-900">{user?.displayName || 'Admin User'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Authorized Manager</p>
          </div>
          <button onClick={() => setActiveTab('settings')} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><Settings className="w-4 h-4" /></button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-72 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />
              <input 
                type="text" 
                placeholder={
                  activeTab === 'inventory' ? "Search parts, engines..." :
                  activeTab === 'customers' ? "Search client name, phone..." :
                  activeTab === 'invoices' ? "Search invoice #, customer..." : "Market search..."
                }
                className="w-full bg-white border border-slate-200 rounded-[1.25rem] pl-12 pr-6 py-3.5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none shadow-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-4 bg-white border border-slate-200 text-slate-400 rounded-full hover:text-emerald-600 transition-all shadow-sm relative group">
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-google-red border-2 border-white rounded-full"></span>
            </button>
            <button 
              onClick={() => { 
                if (activeTab === 'inventory') { setEditingPart(null); setIsFormOpen(true); }
                else if (activeTab === 'customers') { setEditingCustomer(null); setIsCustomerFormOpen(true); }
                else if (activeTab === 'invoices') { setIsInvoiceFormOpen(true); }
              }}
              className="flex items-center gap-3 bg-slate-900 text-white pl-6 pr-8 py-3.5 rounded-full font-black text-sm hover:bg-emerald-700 hover:scale-[1.02] shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
              {activeTab === 'inventory' ? 'NEW STOCK' : activeTab === 'customers' ? 'NEW CLIENT' : 'NEW INVOICE'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-10 py-10 max-w-7xl mx-auto space-y-12">
          {/* Welcome Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-3">
                {activeTab === 'inventory' ? 'Inventory Dashboard' : 
                 activeTab === 'customers' ? 'Client Relationships' : 
                 activeTab === 'invoices' ? 'Billing Operations' : 'Market Insights'} — {currentTenant.name}
              </p>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                {activeTab === 'dashboard' ? 'Business Intelligence' :
                 activeTab === 'inventory' ? 'Live Stock Control' : 
                 activeTab === 'customers' ? 'Customer Directory' : 
                 activeTab === 'invoices' ? 'Sales Ledger' : 'Global Settings'}
              </h2>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'inventory' ? (
              <motion.div 
                key="inventory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col lg:flex-row gap-10"
              >
                {/* Inventory Sidebar Filters */}
                <aside className="w-full lg:w-80 shrink-0 space-y-10">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 h-fit sticky top-32">
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Master Filters</h4>
                       <button 
                        onClick={() => { setFilterCategory(''); setFilterBrand(''); setSearchQuery(''); setFilterStockStatus('all'); setFilterPriceRange({min:0, max:10000000}); }}
                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700"
                       >
                        Clear
                       </button>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Availability</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'all', label: 'All' },
                            { id: 'in-stock', label: 'In Stock' },
                            { id: 'low-stock', label: 'Low Stock' },
                            { id: 'out-of-stock', label: 'Empty' }
                          ].map(status => (
                            <button
                              key={status.id}
                              onClick={() => setFilterStockStatus(status.id)}
                              className={cn(
                                "px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2",
                                filterStockStatus === status.id 
                                  ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                                  : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                              )}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Part Category</label>
                        <select 
                          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none appearance-none cursor-pointer"
                          value={filterCategory}
                          onChange={e => setFilterCategory(e.target.value)}
                        >
                          <option value="">All Types</option>
                          {Array.from(new Set(parts.map(p => p.category))).map((cat) => (
                            <option key={cat as string} value={cat as string}>{(cat as string).replace(/-/g, ' ')}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vehicle Brand</label>
                        <select 
                          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none appearance-none cursor-pointer"
                          value={filterBrand}
                          onChange={e => setFilterBrand(e.target.value)}
                        >
                          <option value="">All Brands</option>
                          {Array.from(new Set(parts.map(p => p.brand))).map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Car Model Search</label>
                        <input 
                          type="text"
                          placeholder="e.g. Camry, Corolla"
                          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                          value={filterModel}
                          onChange={e => setFilterModel(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Price Control (₦)</label>
                        <div className="space-y-2">
                           <input 
                            type="range" 
                            min="0" 
                            max="500000" 
                            step="5000"
                            value={filterPriceRange.max}
                            onChange={e => setFilterPriceRange(p => ({ ...p, max: Number(e.target.value) }))}
                            className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                           />
                           <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                             <span>₦0</span>
                             <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">UP TO {formatNaira(filterPriceRange.max)}</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 mt-4">
                      <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
                         <div className="relative z-10">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Inventory Health</p>
                            <h5 className="text-xl font-black italic tracking-tighter">
                              {Math.round((parts.filter(p => p.quantity > 0).length / Math.max(1, parts.length)) * 100)}%
                            </h5>
                            <p className="text-[10px] font-bold text-emerald-400">In-Stock Rate</p>
                         </div>
                         <TrendingUp className="absolute -bottom-4 -right-4 w-20 h-20 text-white/5 opacity-40 rotate-12" />
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Main Table Area */}
                <div className="flex-1 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Showing SKU</p>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{filteredParts.length} Parts</h4>
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Value</p>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{formatNaira(filteredParts.reduce((a, b) => a + (b.price * b.quantity), 0))}</h4>
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Low Warning</p>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{filteredParts.filter(p => p.quantity > 0 && p.quantity <= 5).length} Items</h4>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                         Inventory Ledger
                         <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase font-black">{currentTenant.name}</span>
                      </h3>
                    </div>
                    <InventoryTable 
                      parts={filteredParts} 
                      onEdit={(p) => { setEditingPart(p); setIsFormOpen(true); }}
                      onDelete={handleDeletePart}
                      onShare={shareToWhatsApp}
                    />
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'customers' ? (
              <motion.div 
                key="customers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <StatCard title="Active Clients" value={customers.length} icon={Users} iconClassName="text-white bg-google-blue" />
                  <StatCard title="Total Sales" value={formatNaira(invoices.reduce((a, b) => a + b.total, 0))} icon={TrendingUp} iconClassName="text-white bg-emerald-600" />
                  <StatCard title="Average Order" value={formatNaira(invoices.length > 0 ? invoices.reduce((a, b) => a + b.total, 0) / invoices.length : 0)} icon={Receipt} iconClassName="text-white bg-google-yellow" />
                </div>
                <CustomerList 
                  customers={filteredCustomers} 
                  onEdit={(c) => { setEditingCustomer(c); setIsCustomerFormOpen(true); }}
                  onDelete={handleDeleteCustomer}
                />
              </motion.div>
            ) : activeTab === 'invoices' ? (
              <motion.div 
                key="invoices"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <InvoiceList 
                  invoices={filteredInvoices}
                  customers={customers}
                  onView={(inv) => setViewingInvoice(inv)}
                  onShareWhatsApp={shareInvoiceWhatsApp}
                  onShareEmail={shareInvoiceEmail}
                />
              </motion.div>
            ) : activeTab === 'settings' ? (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <TenantSettings 
                  tenant={currentTenant}
                  onSave={handleUpdateTenant}
                />
              </motion.div>
            ) : activeTab === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-12"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <StatCard 
                    title="Total SKU" 
                    value={stats.totalItems} 
                    icon={Layers} 
                    iconClassName="text-white bg-google-blue"
                  />
                  <StatCard 
                    title="Stock Value" 
                    value={formatNaira(stats.totalValue)} 
                    icon={TrendingUp} 
                    description="Live Valuation"
                    iconClassName="text-white bg-emerald-600"
                  />
                  <StatCard 
                    title="Low Stock" 
                    value={stats.lowStockItems} 
                    icon={AlertCircle} 
                    iconClassName="text-white bg-amber-500"
                  />
                  <StatCard 
                    title="Out of Stock" 
                    value={stats.outOfStockItems} 
                    icon={Package} 
                    iconClassName="text-white bg-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* FX Adjuster Tool */}
                <div className="md:col-span-2 google-card p-12 relative overflow-hidden bg-white/50 backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Parallel Market <br/>Risk Adjuster</h3>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Bulk Price Management</p>
                    </div>
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-500/10">
                      <DollarSign className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Current CBN Rate: ₦1,550/$ | Market Rate?</p>
                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300">₦</span>
                          <input 
                            type="number" 
                            id="fx-rate-input"
                            placeholder="1650"
                            className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-black text-xl text-slate-900 focus:border-emerald-500 outline-none transition-all"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const val = (document.getElementById('fx-rate-input') as HTMLInputElement).value;
                            if (val) bulkUpdateFX(Number(val));
                          }}
                          className="px-8 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Apply Global Update
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-4 font-medium italic">
                        * This will automatically recalculate selling prices for all parts with a USD cost base, targeting a 30% margin.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-naija-green-700 rounded-[3rem] p-12 text-white flex flex-col justify-between overflow-hidden relative shadow-[0_32px_64px_-12px_rgba(5,150,105,0.4)]">
                  <div className="relative z-10">
                    <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 rotate-3">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-4xl font-black mb-6 leading-[1.1] tracking-tighter italic">Naija Smart <br/>Restock</h3>
                    <p className="text-emerald-100 text-md leading-relaxed mb-10 font-bold">
                       Our Nigerian-tuned engine providing insights on parts to stock up before festive travelling season.
                    </p>
                    <button className="flex items-center gap-3 font-black px-8 py-5 bg-white text-emerald-800 rounded-full hover:shadow-2xl transition-all active:scale-95 text-xs tracking-widest uppercase">
                      REFRESH GURU
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                  <Package className="absolute -bottom-16 -right-16 w-64 h-64 text-white/5 -rotate-12" />
                </div>
              </div>
            </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around z-40 px-8">
          <button onClick={() => setActiveTab('dashboard')} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'dashboard' ? "text-emerald-600" : "text-slate-300")}>
            <TrendingUp className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Dash</span>
          </button>
          <button onClick={() => setActiveTab('inventory')} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'inventory' ? "text-emerald-600" : "text-slate-300")}>
            <Package className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Stock</span>
          </button>
          <button onClick={() => setActiveTab('invoices')} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'invoices' ? "text-emerald-600" : "text-slate-300")}>
            <Receipt className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Bills</span>
          </button>
          <button 
              onClick={() => { 
                if (activeTab === 'inventory') setIsFormOpen(true);
                else if (activeTab === 'customers') setIsCustomerFormOpen(true);
                else if (activeTab === 'invoices') setIsInvoiceFormOpen(true);
              }}
              className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center -mt-12 shadow-2xl shadow-slate-900/30 active:scale-90 transition-all border-4 border-white"
          >
            <Plus className="w-7 h-7" />
          </button>
          <button onClick={() => setActiveTab('customers')} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'customers' ? "text-emerald-600" : "text-slate-300")}>
            <Users className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Clients</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'settings' ? "text-emerald-600" : "text-slate-300")}>
            <Settings className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Setup</span>
          </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <PartForm 
            part={editingPart} 
            tenant={currentTenant}
            onSave={handleSavePart} 
            onAddCustomCategory={handleAddCustomCategory}
            onCancel={() => { setIsFormOpen(false); setEditingPart(null); }} 
          />
        )}
        {isCustomerFormOpen && (
          <CustomerForm 
            customer={editingCustomer}
            onSave={handleSaveCustomer}
            onCancel={() => { setIsCustomerFormOpen(false); setEditingCustomer(null); }}
          />
        )}
        {isInvoiceFormOpen && (
          <InvoiceForm 
            customers={customers}
            parts={parts}
            onSave={handleSaveInvoice}
            onCancel={() => setIsInvoiceFormOpen(false)}
          />
        )}
        {viewingInvoice && (
          <InvoiceView 
            invoice={viewingInvoice}
            customer={customers.find(c => c.id === viewingInvoice.customerId)}
            tenant={currentTenant}
            onClose={() => setViewingInvoice(null)}
            onShareWhatsApp={shareInvoiceWhatsApp}
            onShareEmail={shareInvoiceEmail}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { X, Save, Plus, Trash2, Search, CreditCard, Banknote, Landmark, User, Package, AlertCircle } from 'lucide-react';
import { AutoPart, Customer, Invoice, InvoiceItem, PaymentMethod } from '../types';
import { formatNaira, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface InvoiceFormProps {
  customers: Customer[];
  parts: AutoPart[];
  onSave: (invoice: Omit<Invoice, 'pk' | 'sk' | 'type'>) => void;
  onCancel: () => void;
}

export function InvoiceForm({ customers, parts, onSave, onCancel }: InvoiceFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId), 
    [customers, selectedCustomerId]
  );

  const subtotal = useMemo(() => 
    lineItems.reduce((acc, item) => acc + item.totalPrice, 0),
    [lineItems]
  );

  const tax = subtotal * 0.075; // 7.5% VAT
  const total = subtotal + tax;

  const addItem = (part: AutoPart) => {
    const existing = lineItems.find(item => item.partId === part.id);
    if (existing) {
      setLineItems(lineItems.map(item => 
        item.partId === part.id 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setLineItems([...lineItems, {
        partId: part.id,
        name: part.name,
        quantity: 1,
        unitPrice: part.price,
        totalPrice: part.price
      }]);
    }
  };

  const removeItem = (partId: string) => {
    setLineItems(lineItems.filter(item => item.partId !== partId));
  };

  const updateQuantity = (partId: string, quantity: number) => {
    if (quantity < 1) return;
    setLineItems(lineItems.map(item => 
      item.partId === partId 
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    ));
  };

  const handleSave = async () => {
    setError(null);
    if (!selectedCustomerId || lineItems.length === 0) {
      setError('Please select a customer and add at least one item.');
      return;
    }

    const newInvoice: Omit<Invoice, 'pk' | 'sk' | 'type'> = {
      id: Math.random().toString(36).substr(2, 9),
      tenantId: '', // Tenant ID is assigned in handleSaveInvoice in App.tsx
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      items: lineItems,
      subtotal,
      tax,
      total,
      paymentMethod,
      status: paymentMethod === 'Online' ? 'Pending' : 'Paid',
      createdAt: new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      await onSave(newInvoice);
      
      if (paymentMethod === 'Online') {
        // Logic for online payment: Simulate opening a Paystack/Flutterwave link
        window.open(`https://simulate-payment.com/pay?amount=${total}&ref=${newInvoice.invoiceNumber}`, '_blank');
      }
    } catch (err: any) {
      console.error('Invoice save error:', err);
      try {
        const errObj = JSON.parse(err.message);
        setError(`Save failed: ${errObj.error || 'Permission denied'}`);
      } catch {
        setError('Failed to process invoice. Check your connection.');
      }
      setIsSaving(false);
    }
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
      onClick={onCancel}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl flex h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Invoice details */}
        <div className="flex-1 flex flex-col border-r border-slate-50">
          <div className="px-10 py-8 border-b border-slate-50">
             <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Generate Invoice</h2>
             <p className="text-[10px] uppercase font-black text-emerald-600 tracking-[0.2em] mt-1">Naija Auto Billing System</p>
          </div>

          <div className="flex-1 p-10 overflow-y-auto space-y-8">
            {/* Customer Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Select Customer</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <select 
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none appearance-none"
                >
                  <option value="">Choose a client...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added Parts</label>
                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{lineItems.length} items</span>
              </div>
              
              <div className="space-y-3">
                {lineItems.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                    <Package className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No parts added yet</p>
                  </div>
                ) : (
                  lineItems.map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={item.partId} 
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl group transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{formatNaira(item.unitPrice)} / unit</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                        <button onClick={() => updateQuantity(item.partId, item.quantity - 1)} className="text-slate-400 hover:text-red-500 transition-colors">-</button>
                        <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.partId, item.quantity + 1)} className="text-slate-400 hover:text-emerald-600 transition-colors">+</button>
                      </div>
                      <div className="text-right min-w-[80px]">
                         <p className="text-xs font-black text-slate-900">{formatNaira(item.totalPrice)}</p>
                      </div>
                      <button onClick={() => removeItem(item.partId)} className="p-2 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Payment Method</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'Cash', icon: Banknote, color: 'emerald' },
                  { id: 'Online', icon: CreditCard, color: 'blue' },
                  { id: 'Transfer', icon: Landmark, color: 'orange' }
                ].map(method => (
                  <button 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all group",
                      paymentMethod === method.id 
                        ? `bg-${method.color}-50 border-${method.color}-500 text-${method.color}-700 shadow-lg shadow-${method.color}-500/10 scale-105` 
                        : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <method.icon className={cn(
                      "w-6 h-6",
                      paymentMethod === method.id ? `text-${method.color}-600` : "text-slate-300 group-hover:text-slate-600"
                    )} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{method.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-10 bg-slate-50 border-t border-slate-100 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>SUBTOTAL</span>
                  <span>{formatNaira(subtotal)}</span>
               </div>
               <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>VAT (7.5%)</span>
                  <span>{formatNaira(tax)}</span>
               </div>
               <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>TOTAL</span>
                  <span className="text-emerald-700 italic">{formatNaira(total)}</span>
               </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={onCancel} 
                disabled={isSaving}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 disabled:opacity-50"
              >
                CANCEL
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-full shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-google-green" />
                )}
                {isSaving ? 'Processing...' : 'Finalize & Print'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Part Selector */}
        <div className="w-[400px] bg-slate-50/50 flex flex-col">
          <div className="p-8 pb-4">
             <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search parts..." 
                 className="w-full bg-white border border-slate-200 rounded-full pl-12 pr-6 py-3 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
               />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3">
             {filteredParts.map(part => (
               <button 
                 key={part.id}
                 onClick={() => addItem(part)}
                 disabled={part.quantity === 0}
                 className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-500 hover:shadow-lg transition-all group disabled:opacity-50 text-left"
               >
                 <div className="flex-1">
                   <p className="text-[10px] font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase">{part.name}</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Stock: {part.quantity} units</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{formatNaira(part.price)}</p>
                    <div className="bg-emerald-100 text-emerald-600 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <Plus className="w-3 h-3" />
                    </div>
                 </div>
               </button>
             ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

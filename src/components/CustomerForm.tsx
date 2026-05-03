import React, { useState } from 'react';
import { X, Save, User, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { Customer } from '../types';
import { motion } from 'motion/react';

interface CustomerFormProps {
  customer?: Customer | null;
  onSave: (customer: Omit<Customer, 'pk' | 'sk' | 'type'>) => void;
  onCancel: () => void;
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<Omit<Customer, 'pk' | 'sk' | 'type'>>({
    id: customer?.id || Math.random().toString(36).substr(2, 9),
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    totalSpent: customer?.totalSpent || 0,
    lastVisit: customer?.lastVisit || new Date().toISOString(),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!formData.name) {
      setError('Name is required');
      return;
    }
    if (!formData.phone) {
      setError('Phone number is required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (err: any) {
      console.error('Save error:', err);
      try {
        const errObj = JSON.parse(err.message);
        setError(`Save failed: ${errObj.error || 'Permission denied'}`);
      } catch {
        setError('Failed to save customer. Please check your connection.');
      }
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
      onClick={onCancel}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-10 py-8 border-b border-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">
              {customer ? 'Update Client' : 'Register Client'}
            </h2>
            <p className="text-[10px] uppercase font-black text-emerald-600 tracking-[0.2em] mt-1">Customer Relationship Hub</p>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-900 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-10 py-10 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="John Doe"
                className="w-full px-14 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text"
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                placeholder="080 1234 5678"
                className="w-full px-14 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address (Optional)</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="email"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="john@example.com"
                className="w-full px-14 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Store Address</label>
            <div className="relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text"
                value={formData.address}
                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                placeholder="Ladipo, Lagos"
                className="w-full px-14 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="px-10 py-10 bg-slate-50 flex flex-col gap-4">
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
          <div className="flex gap-6">
            <button 
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 py-5 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-[2] py-5 bg-slate-900 text-white font-black rounded-full hover:bg-emerald-600 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : (customer ? 'Update Client' : 'Add to Directory')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

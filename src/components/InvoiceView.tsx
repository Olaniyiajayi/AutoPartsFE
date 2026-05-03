import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, Download, Share2, MessageCircle, Mail, MapPin, Phone, Globe, ShieldCheck } from 'lucide-react';
import { Invoice, Customer, Tenant } from '../types';
import { formatNaira } from '../lib/utils';

interface InvoiceViewProps {
  invoice: Invoice;
  customer: Customer | undefined;
  tenant: Tenant;
  onClose: () => void;
  onShareWhatsApp: (invoice: Invoice, customer: Customer) => void;
  onShareEmail: (invoice: Invoice, customer: Customer) => void;
}

export function InvoiceView({ invoice, customer, tenant, onClose, onShareWhatsApp, onShareEmail }: InvoiceViewProps) {
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="bg-white rounded-[3rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic leading-none">Official Invoice</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Verified Purchase Ledger</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
              <Download className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <button 
              onClick={onClose}
              className="p-3 bg-white border border-slate-100 text-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12 print:p-0">
          {/* Top Info */}
          <div className="flex justify-between items-start">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-naija-green-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 rotate-3">
                  <Globe className="w-8 h-8" />
                </div>
                <div>
                   <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{tenant.name}</h1>
                   <div className="flex items-center gap-3 text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">
                     <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Lagos, Nigeria</span>
                     <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                     <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {tenant.phone || '+234 81 2345 6789'}</span>
                   </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billed To</p>
                <h4 className="text-xl font-black text-slate-900">{invoice.customerName}</h4>
                <p className="text-xs text-slate-500 font-medium">Lagos Client #{invoice.customerId.slice(-4).toUpperCase()}</p>
                {customer?.phone && <p className="text-xs text-emerald-600 font-bold mt-2">{customer.phone}</p>}
                {customer?.email && <p className="text-xs text-slate-400 font-medium">{customer.email}</p>}
              </div>
            </div>

            <div className="text-right space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Number</p>
                <h2 className="text-2xl font-black text-slate-900 font-mono tracking-tighter">#{invoice.invoiceNumber}</h2>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</p>
                <h4 className="text-sm font-black text-slate-600">{new Date(invoice.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}</h4>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                Status: {invoice.status}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-6">
             <div className="grid grid-cols-12 px-6 py-4 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="col-span-6">Product Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
             </div>
             <div className="space-y-2">
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 px-6 py-6 hover:bg-slate-50 transition-colors rounded-2xl group">
                    <div className="col-span-6">
                      <h5 className="text-sm font-black text-slate-900 uppercase group-hover:text-emerald-600 transition-colors">{item.name}</h5>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Genuine Aftermarket Spare</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-sm font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{item.quantity}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-sm font-bold text-slate-500">{formatNaira(item.unitPrice)}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-sm font-black text-slate-900">{formatNaira(item.totalPrice)}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-6 border-t border-slate-100">
            <div className="w-80 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold">Subtotal</span>
                <span className="text-slate-600 font-black">{formatNaira(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold">VAT (0%)</span>
                <span className="text-slate-600 font-black">₦0.00</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="space-y-0.5">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Amount Paid</p>
                   <p className="text-xs text-slate-400 font-medium">Via {invoice.paymentMethod}</p>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{formatNaira(invoice.total)}</h3>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden">
             <div className="relative z-10 max-w-lg">
                <h4 className="text-lg font-black italic mb-4">Important Note:</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-bold">
                  All spare parts are subject to a 7-day mechanical warranty if installed by a certified AutoFix Naija technician. Return of electrical parts is strictly prohibited once seal is broken.
                </p>
             </div>
             <ShieldCheck className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
          </div>
        </div>

        {/* Quick Share Bar */}
        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Share to Client</p>
           </div>
           <div className="flex items-center gap-3">
              {customer && customer.phone && (
                <button 
                  onClick={() => onShareWhatsApp(invoice, customer)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
              )}
              {customer && customer.email && (
                <button 
                  onClick={() => onShareEmail(invoice, customer)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              )}
              <button className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-full transition-all">
                <Share2 className="w-4 h-4" />
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { FileText, CreditCard, Banknote, Clock, CheckCircle, XCircle, MessageCircle, Mail } from 'lucide-react';
import { Invoice, Customer } from '../types';
import { formatNaira, cn } from '../lib/utils';

interface InvoiceListProps {
  invoices: Invoice[];
  customers: Customer[];
  onView: (invoice: Invoice) => void;
  onShareWhatsApp: (invoice: Invoice, customer: Customer) => void;
  onShareEmail: (invoice: Invoice, customer: Customer) => void;
}

export function InvoiceList({ invoices, customers, onView, onShareWhatsApp, onShareEmail }: InvoiceListProps) {
  const getCustomer = (customerId: string) => customers.find(c => c.id === customerId);
  return (
    <div className="google-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inv #</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50 group">
                <td className="px-8 py-5">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-50 px-2 py-1 rounded">
                    {invoice.invoiceNumber}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase">
                    {invoice.customerName}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-black text-slate-900">
                    {formatNaira(invoice.total)}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    {invoice.paymentMethod === 'Online' ? (
                      <CreditCard className="w-3 h-3 text-blue-500" />
                    ) : (
                      <Banknote className="w-3 h-3 text-emerald-500" />
                    )}
                    {invoice.paymentMethod}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={cn(
                    "flex items-center gap-1.5 px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest w-fit",
                    invoice.status === 'Paid' ? "bg-emerald-50 text-emerald-600" : 
                    invoice.status === 'Pending' ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                  )}>
                    {invoice.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : 
                     invoice.status === 'Pending' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {invoice.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {(() => {
                      const customer = getCustomer(invoice.customerId);
                      return (
                        <>
                          {customer?.phone && (
                            <button 
                              onClick={() => onShareWhatsApp(invoice, customer)}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              title="Share to WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          )}
                          {customer?.email && (
                            <button 
                              onClick={() => onShareEmail(invoice, customer)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="Send Email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      );
                    })()}
                    <button 
                      onClick={() => onView(invoice)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-600 transition-all"
                    >
                      <FileText className="w-3 h-3" />
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

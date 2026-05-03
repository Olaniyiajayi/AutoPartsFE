import React from 'react';
import { User, Phone, Mail, Trash2, Edit2 } from 'lucide-react';
import { Customer } from '../types';
import { formatNaira } from '../lib/utils';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export function CustomerList({ customers, onEdit, onDelete }: CustomerListProps) {
  return (
    <div className="google-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Value</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Visit</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50 group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                      {customer.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase text-sm tracking-tight">
                      {customer.name}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Phone className="w-3 h-3 text-emerald-500" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                        <Mail className="w-3 h-3 text-blue-400" />
                        {customer.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-black text-slate-900">
                    {formatNaira(customer.totalSpent)}
                  </span>
                </td>
                <td className="px-8 py-5 text-xs text-slate-400 font-bold">
                  {new Date(customer.lastVisit).toLocaleDateString()}
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => onEdit(customer)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(customer.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
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

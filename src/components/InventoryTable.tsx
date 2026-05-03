import { Edit2, Trash2, AlertTriangle, Search, Filter, Share2 } from 'lucide-react';
import { AutoPart } from '../types';
import { formatNaira, cn } from '../lib/utils';

interface InventoryTableProps {
  parts: AutoPart[];
  onEdit: (part: AutoPart) => void;
  onDelete: (id: string) => void;
  onShare: (part: AutoPart) => void;
}

export function InventoryTable({ parts, onEdit, onDelete, onShare }: InventoryTableProps) {
  return (
    <div className="google-card overflow-x-auto overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Part Details</th>
            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand / SKU</th>
            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock Status</th>
            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {parts.map((part) => {
            const isLowStock = part.quantity <= part.minStockLevel && part.quantity > 0;
            const isOutOfStock = part.quantity === 0;

            return (
              <tr key={part.id} className="hover:bg-slate-50 group transition-all">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                      {part.imageUrl ? (
                        <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                          No PX
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase text-sm tracking-tight">{part.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">{part.location}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{part.brand}</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter mb-0.5">{part.series || 'N/A'}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 px-1 rounded inline-block w-max">{part.sku}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="inline-flex px-3 py-1 text-[10px] font-black rounded-full bg-slate-100 text-slate-600 uppercase tracking-widest whitespace-nowrap">
                    {part.category.replace(/-/g, ' ')}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <div className={cn(
                          "w-2 h-2 rounded-full",
                          isOutOfStock ? "bg-google-red" : isLowStock ? "bg-google-yellow" : "bg-google-green"
                       )} />
                       <span className={cn(
                        "text-sm font-black tracking-tight",
                        isOutOfStock ? "text-google-red" : isLowStock ? "text-orange-600" : "text-emerald-600"
                       )}>
                        {part.quantity}
                       </span>
                    </div>
                    {isLowStock && <span className="text-[9px] font-black text-orange-400 uppercase">Restock Soon</span>}
                    {isOutOfStock && <span className="text-[9px] font-black text-red-500 uppercase italic">Empty</span>}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-black text-slate-900">
                    {formatNaira(part.price)}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    <button 
                      onClick={() => onShare(part)}
                      title="Share to WhatsApp"
                      className="p-2 text-emerald-500 hover:bg-emerald-100 rounded-full transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onEdit(part)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(part.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {parts.length === 0 && (
        <div className="p-20 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <Search className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching parts in stock</p>
        </div>
      )}
    </div>
  );
}

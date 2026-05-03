import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  className,
  iconClassName
}: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "google-card p-7",
        className
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-4 rounded-2xl", iconClassName || "bg-slate-50")}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
            trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          )}>
            {trend.isUp ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</h3>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        {description && <p className="text-[10px] text-slate-400 mt-2 font-medium">{description}</p>}
      </div>
    </motion.div>
  );
}

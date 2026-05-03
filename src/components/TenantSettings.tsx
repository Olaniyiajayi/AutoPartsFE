import React, { useState } from 'react';
import { Store, MapPin, Phone, Mail, Save, Image as ImageIcon, Globe, Camera, Upload, RefreshCw } from 'lucide-react';
import { Tenant } from '../types';
import { motion } from 'motion/react';
import { seedDemoTenant } from '../lib/seeding';

interface TenantSettingsProps {
  tenant: Tenant;
  onSave: (tenant: Tenant) => void;
}

export function TenantSettings({ tenant, onSave }: TenantSettingsProps) {
  const [formData, setFormData] = useState<Tenant>({ ...tenant });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl space-y-10">
      <div className="google-card p-12 relative overflow-hidden bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-12">
          <div>
            <h3 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Branch <br/>Branding</h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Customise your business identity</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload}
                id="tenant-logo-upload"
                className="hidden" 
              />
              <label 
                htmlFor="tenant-logo-upload"
                className="w-24 h-24 bg-slate-100 text-slate-400 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-200 cursor-pointer hover:border-emerald-500 hover:bg-white transition-all overflow-hidden relative shadow-lg shadow-slate-900/5 group"
              >
                {formData.logo ? (
                  <>
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-[7px] font-black uppercase tracking-widest">Upload</span>
                  </div>
                )}
              </label>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Business Logo</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Recommended: 512x512px</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Business Name</label>
            <div className="relative">
              <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-[1.25rem] focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Physical Location</label>
            <div className="relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text"
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-[1.25rem] focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Phone</label>
            <div className="relative">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text"
                value={formData.phone || ''}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-[1.25rem] focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Business Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-[1.25rem] focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Logo URL (Icon)</label>
            <div className="relative">
              <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text"
                value={formData.logo || ''}
                onChange={e => setFormData(p => ({ ...p, logo: e.target.value }))}
                placeholder="https://example.com/logo.png"
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-[1.25rem] focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-between items-center">
          {tenant.id === '1' ? (
            <button 
              onClick={async () => {
                if(confirm('Re-seed demo data for tenant 1? This will overwrite existing records.')) {
                   await seedDemoTenant();
                   window.location.reload();
                }
              }}
              className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-3 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Demo Master Data
            </button>
          ) : <div />}
          <button 
            onClick={() => onSave(formData)}
            className="px-10 py-5 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl flex items-center gap-3"
          >
            <Save className="w-5 h-5 text-google-yellow" />
            Save Profile
          </button>
        </div>
      </div>

      <div className="google-card p-12 bg-emerald-900 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-2xl font-black tracking-tighter mb-4 italic">Invoice Preview</h4>
          <div className="bg-white rounded-3xl p-8 text-slate-900 max-w-sm ml-auto">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-[8px] font-black overflow-hidden shadow-sm">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    formData.name[0]
                  )}
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase leading-none tracking-tight">{formData.name}</p>
                   <p className="text-[7px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{formData.location}</p>
                </div>
             </div>
             <div className="border-t border-dashed border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-[8px] font-black">
                   <span className="text-slate-400">ITEM</span>
                   <span>TOTAL</span>
                </div>
                <div className="flex justify-between text-[8px] font-bold">
                   <span>FRONT SHOCK</span>
                   <span>{formData.currencySymbol || '₦'}45,000</span>
                </div>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[50%] h-full bg-google-green opacity-20 blur-[100px] pointer-events-none" />
      </div>
    </div>
  );
}

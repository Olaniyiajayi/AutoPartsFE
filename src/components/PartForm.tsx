import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Camera, ChevronRight, AlertCircle } from 'lucide-react';
import { AutoPart, Tenant } from '../types';
import { geminiService } from '../services/geminiService';
import { inventoryService } from '../services/inventoryService';
import { motion, AnimatePresence } from 'motion/react';
import { CAR_BRANDS, COMMON_MODELS, LOCAL_PART_TYPES, VEHICLE_SERIES } from '../constants';
import { cn } from '../lib/utils';

interface PartFormProps {
  part?: AutoPart | null;
  tenant: Tenant;
  onSave: (part: Omit<AutoPart, 'pk' | 'sk' | 'type' | 'tenantId'>) => void | Promise<void>;
  onAddCustomCategory: (category: string) => void;
  onCancel: () => void;
}

export function PartForm({ part, tenant, onSave, onAddCustomCategory, onCancel }: PartFormProps) {
  const [formData, setFormData] = useState<Omit<AutoPart, 'pk' | 'sk' | 'type' | 'tenantId'>>({
    id: part?.id || Math.random().toString(36).substr(2, 9),
    name: part?.name || '',
    sku: part?.sku || '',
    category: part?.category || LOCAL_PART_TYPES[0].id,
    brand: part?.brand || '',
    series: part?.series || '',
    compatibleModels: part?.compatibleModels || [],
    price: part?.price || 0,
    quantity: part?.quantity || 0,
    minStockLevel: part?.minStockLevel || 5,
    location: part?.location || '',
    description: part?.description || '',
    imageUrl: part?.imageUrl || '',
    imageUrls: part?.imageUrls || [],
    lastUpdated: new Date().toISOString(),
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelInput, setModelInput] = useState('');
  const [newCatInput, setNewCatInput] = useState('');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);

  // Auto-generate SKU for new parts
  useEffect(() => {
    if (!part && !formData.sku && tenant.id) {
      generateSKU();
    }
  }, [tenant.id]);

  const generateSKU = async () => {
    try {
      const newSku = await inventoryService.generateNextSKU(tenant.id);
      setFormData(prev => ({ ...prev, sku: newSku }));
    } catch (error) {
      console.error('Failed to generate SKU:', error);
    }
  };

  const handleCreateCustomCategory = () => {
    if (newCatInput.trim()) {
      onAddCustomCategory(newCatInput.trim());
      setFormData(p => ({ ...p, category: newCatInput.trim() }));
      setNewCatInput('');
      setIsAddingNewCat(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      const fileArray = Array.from(files) as File[];
      
      let processedCount = 0;
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          processedCount++;
          if (processedCount === fileArray.length) {
            setFormData(prev => {
              const updatedUrls = [...(prev.imageUrls || []), ...newImages];
              return { 
                ...prev, 
                imageUrls: updatedUrls,
                imageUrl: prev.imageUrl || updatedUrls[0] // Set primary if not exists
              };
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const updatedUrls = (prev.imageUrls || []).filter((_, i) => i !== index);
      return {
        ...prev,
        imageUrls: updatedUrls,
        imageUrl: prev.imageUrl === (prev.imageUrls?.[index]) ? (updatedUrls[0] || '') : prev.imageUrl
      };
    });
  };

  const setPrimaryImage = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleAiIdentify = async () => {
    if (!formData.name && !formData.description) return;
    setAiLoading(true);
    try {
      const result = await geminiService.identifyPart(`${formData.name} ${formData.description}`);
      setFormData(prev => ({
        ...prev,
        ...result,
        category: result.category || prev.category,
      }));
    } catch (error) {
      alert("AI Assistant couldn't identify the part details. Please fill manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddModel = () => {
    if (modelInput.trim()) {
      setFormData(prev => ({
        ...prev,
        compatibleModels: [...prev.compatibleModels, modelInput.trim()]
      }));
      setModelInput('');
    }
  };

  const removeModel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      compatibleModels: prev.compatibleModels.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!formData.name || formData.name.length < 2) {
      setError('Part name must be at least 2 characters');
      return;
    }

    if (formData.price < 0) {
      setError('Price cannot be negative');
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
        setError('Failed to save part. Please check your connection and permissions.');
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
        className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-10 py-8 border-b border-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">
              {part ? 'Update Spare' : 'Register New Part'}
            </h2>
            <p className="text-[10px] uppercase font-black text-emerald-600 tracking-[0.2em] mt-1">Lagos Branch Inventory</p>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-slate-50 rounded-full transition-all text-slate-300 hover:text-slate-900 group">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <div className="px-10 py-10 h-[65vh] overflow-y-auto space-y-8 scrollbar-hide">
          <div className="space-y-4">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mechanical Gallery (Photos)</label>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">
                {formData.imageUrls?.length || 0} Assets
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <AnimatePresence>
                {formData.imageUrls?.map((url, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={url} 
                    className="relative aspect-square group cursor-pointer"
                    onClick={() => setPrimaryImage(url)}
                  >
                    <div className={cn(
                      "w-full h-full rounded-2xl overflow-hidden border-2 transition-all shadow-sm",
                      formData.imageUrl === url ? "border-emerald-500 shadow-lg shadow-emerald-500/10" : "border-transparent bg-slate-50"
                    )}>
                      <img 
                        src={url} 
                        alt={`Part ${idx}`} 
                        className={cn(
                          "w-full h-full object-cover transition-transform duration-500",
                          formData.imageUrl === url ? "scale-105" : "group-hover:scale-110"
                        )}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    {formData.imageUrl === url && (
                      <div className="absolute -top-2 -left-2 bg-emerald-500 text-white p-1 rounded-lg shadow-lg">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute -top-2 -right-2 bg-white text-slate-400 p-1.5 rounded-xl shadow-lg border border-slate-100 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {(formData.imageUrls?.length || 0) < 4 && (
                <div className="relative aspect-square">
                  <input 
                    type="file" 
                    multiple
                    accept="image/*" 
                    onChange={handleImageUpload}
                    id="part-image-upload"
                    className="hidden" 
                  />
                  <label 
                    htmlFor="part-image-upload"
                    className="flex flex-col items-center justify-center w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-600 transition-all text-slate-300"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-2">
                       <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center">Add Photo</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Part Name</label>
              <div className="flex gap-3">
                <input 
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. V6 Engine Gasket"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
                />
                <button 
                  onClick={handleAiIdentify}
                  disabled={aiLoading}
                  className="flex items-center gap-3 px-6 bg-slate-900 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 transition-all whitespace-nowrap font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10"
                >
                  {aiLoading ? 'IDENTIFYING...' : <><Sparkles className="w-4 h-4 text-google-yellow" /> AI GURU</>}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Part Type</label>
              <div className="relative">
                {isAddingNewCat ? (
                  <div className="flex gap-2">
                    <input 
                      autoFocus
                      type="text"
                      value={newCatInput}
                      onChange={e => setNewCatInput(e.target.value)}
                      placeholder="Custom Type"
                      className="w-full px-6 py-4 bg-emerald-50 border-2 border-emerald-500 rounded-[1.25rem] font-bold text-slate-900 outline-none"
                    />
                    <button onClick={handleCreateCustomCategory} className="p-4 bg-emerald-600 text-white rounded-2xl"><Save className="w-4 h-4"/></button>
                    <button onClick={() => setIsAddingNewCat(false)} className="p-4 bg-slate-100 text-slate-400 rounded-2xl"><X className="w-4 h-4"/></button>
                  </div>
                ) : (
                  <>
                    <select 
                      value={formData.category}
                      onChange={e => {
                        if (e.target.value === '__add_new__') {
                          setIsAddingNewCat(true);
                        } else {
                          setFormData(p => ({ ...p, category: e.target.value }));
                        }
                      }}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 appearance-none outline-none"
                    >
                      <optgroup label="Standard Types">
                        {LOCAL_PART_TYPES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </optgroup>
                      {(tenant.customCategories?.length || 0) > 0 && (
                        <optgroup label="Your Custom Types">
                          {tenant.customCategories?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </optgroup>
                      )}
                      <option value="__add_new__">+ Create New Type...</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Part Serial / SKU</label>
              <div className="relative group/sku">
                <input 
                  type="text"
                  value={formData.sku}
                  onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))}
                  placeholder="SKU-XXXXX"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none pr-12"
                />
                <button 
                  type="button"
                  onClick={generateSKU}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Regenerate SKU"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Warehouse Spot</label>
              <input 
                type="text"
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                placeholder="Section B, Row 4"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vehicle Make</label>
              <div className="relative">
                <select 
                  value={formData.brand}
                  onChange={e => setFormData(p => ({ ...p, brand: e.target.value, series: '' }))}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 appearance-none outline-none"
                >
                  <option value="">Select Make</option>
                  {CAR_BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Model</label>
              <div className="relative">
                <select 
                  value={modelInput}
                  onChange={e => setModelInput(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 appearance-none outline-none"
                >
                  <option value="">Select Model</option>
                  {formData.brand && COMMON_MODELS[formData.brand] ? (
                    COMMON_MODELS[formData.brand].map(m => <option key={m} value={m}>{m}</option>)
                  ) : (
                    <option disabled>Select Make first</option>
                  )}
                  <option value="Manual">+ Other Model</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vehicle Series (Generation)</label>
              <div className="relative">
                <select 
                  value={formData.series || ''}
                  onChange={e => setFormData(p => ({ ...p, series: e.target.value }))}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 appearance-none outline-none"
                >
                  <option value="">N/A</option>
                  {formData.brand && modelInput && VEHICLE_SERIES[formData.brand]?.[modelInput]?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="Manual">+ Other Series</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Selling Price (₦)</label>
              <input 
                type="number"
                value={formData.price}
                onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))}
                className="w-full px-6 py-4 bg-emerald-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-black text-emerald-700 text-xl outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Import Cost ($)</label>
              <input 
                type="number"
                value={formData.costPriceUSD || 0}
                onChange={e => setFormData(p => ({ ...p, costPriceUSD: Number(e.target.value) }))}
                placeholder="0.00"
                className="w-full px-6 py-4 bg-blue-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-blue-500 transition-all font-black text-blue-700 text-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">In Stock</label>
                <input 
                  type="number"
                  value={formData.quantity}
                  onChange={e => setFormData(p => ({ ...p, quantity: Number(e.target.value) }))}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-blue-500 transition-all font-black text-slate-900 text-xl outline-none text-center"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Min Level</label>
                <input 
                  type="number"
                  value={formData.minStockLevel}
                  onChange={e => setFormData(p => ({ ...p, minStockLevel: Number(e.target.value) }))}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-red-500 transition-all font-black text-slate-400 text-xl outline-none text-center"
                />
              </div>
            </div>

            <div className="col-span-2 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Model Compatibility</label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  {formData.brand && COMMON_MODELS[formData.brand] ? (
                    <select
                      value={modelInput}
                      onChange={e => setModelInput(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 appearance-none outline-none"
                    >
                      <option value="">Select Model</option>
                      {COMMON_MODELS[formData.brand].map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="Manual">Type manually...</option>
                    </select>
                  ) : (
                    <input 
                      type="text"
                      value={modelInput}
                      onChange={e => setModelInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleAddModel()}
                      placeholder="e.g. Camry 2010"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
                    />
                  )}
                  {formData.brand && COMMON_MODELS[formData.brand] && (
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                  )}
                </div>
                
                {modelInput === 'Manual' && (
                  <input 
                    type="text"
                    autoFocus
                    placeholder="Enter model..."
                    onChange={e => setModelInput(e.target.value)}
                    className="flex-1 px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 outline-none"
                  />
                )}

                <button 
                  onClick={handleAddModel}
                  className="px-8 bg-slate-100 text-slate-500 rounded-[1.25rem] hover:bg-slate-200 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                  ADD
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.compatibleModels.map((model, idx) => (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={idx} 
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100"
                  >
                    {model}
                    <button onClick={() => removeModel(idx)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
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
              className="flex-1 py-5 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:text-slate-900 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSubmit()}
              disabled={isSaving}
              className="flex-[2] py-5 bg-slate-900 text-white font-black rounded-full hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 uppercase tracking-tighter text-sm tracking-widest mb-1 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5 text-google-green" />
              )}
              {isSaving ? 'Saving...' : (part ? 'Update Registry' : 'Commit to Stock')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Save, Truck, Percent, Info, Plus, Minus, LayoutGrid, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminSettings() {
  const [baseShipping, setBaseShipping] = useState<number>(250);
  const [incrementalShipping, setIncrementalShipping] = useState<number>(100);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [collections, setCollections] = useState<string[]>(['Men', 'Shirts', 'Pants', 'Tech-Noir', 'Accessories', 'Shoes']);
  const [newCollection, setNewCollection] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'settings', 'store');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setBaseShipping(data.baseShipping ?? 250);
          setIncrementalShipping(data.incrementalShipping ?? 100);
          setTaxPercentage(data.taxPercentage ?? 0);
          if (data.collections) setCollections(data.collections);
        }
      } catch (e) {
        console.error("Settings Load Error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), {
        baseShipping,
        incrementalShipping,
        taxPercentage,
        collections,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Configuration saved successfully');
    } catch (e) {
      console.error('Failed to save settings:', e);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addCollection = () => {
    if (!newCollection.trim()) return;
    if (collections.includes(newCollection.trim())) {
      toast.error('Collection already exists');
      return;
    }
    setCollections([...collections, newCollection.trim()]);
    setNewCollection('');
  };

  const removeCollection = (name: string) => {
    setCollections(collections.filter(c => c !== name));
  };

  if (loading) return <div className="p-12 text-center text-[#0a0a0a]/60 font-sans tracking-widest uppercase text-[10px]">Loading Maison Settings...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-serif text-[#0a0a0a]">Logistics & Collections</h1>
          <p className="text-sm text-[#0a0a0a]/50 mt-2 font-sans italic">Define your tiered shipping, taxation, and visible collections.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#0a0a0a] text-[#F5F0EB] px-8 py-3 rounded-full flex items-center gap-2 hover:bg-accent hover:text-white transition-all disabled:opacity-50 shadow-xl active:scale-95"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Processing...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tiered Shipping Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-black/10 p-8 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Truck className="w-6 h-6" /></div>
            <h3 className="font-serif text-xl">Tiered Shipping</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 block mb-2">Base Shipping (1st Item)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 font-mono text-xs">Rs.</span>
                <input 
                  type="number" 
                  value={baseShipping} 
                  onChange={(e) => setBaseShipping(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-black/20 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 block mb-2">Each Additional Item (+)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 font-mono text-xs">Rs.</span>
                <input 
                  type="number" 
                  value={incrementalShipping} 
                  onChange={(e) => setIncrementalShipping(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-black/20 transition-all font-mono"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tax Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-black/10 p-8 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Percent className="w-6 h-6" /></div>
            <h3 className="font-serif text-xl">Taxation</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 block mb-2">Tax Percentage (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={taxPercentage} 
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-black/20 transition-all font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 font-mono text-sm">%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Collections Management */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-black/10 p-8 shadow-sm md:col-span-2"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-accent/10 text-accent rounded-xl"><LayoutGrid className="w-6 h-6" /></div>
            <div>
              <h3 className="font-serif text-xl">Collection Categories</h3>
              <p className="text-[10px] uppercase tracking-widest text-black/30 font-bold">Manage visible filters on the shop page</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {collections.map((cat) => (
              <div 
                key={cat} 
                className="flex items-center gap-2 bg-black/[0.03] border border-black/5 px-4 py-2 rounded-full group"
              >
                <span className="text-xs font-medium text-black/70">{cat}</span>
                <button 
                  onClick={() => removeCollection(cat)}
                  className="text-black/20 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <input 
              type="text" 
              value={newCollection}
              onChange={(e) => setNewCollection(e.target.value)}
              placeholder="e.g. Winter Sale"
              className="flex-grow bg-gray-50 border border-black/5 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-black/20 transition-all font-sans"
              onKeyDown={(e) => e.key === 'Enter' && addCollection()}
            />
            <button 
              onClick={addCollection}
              className="bg-black text-white px-8 rounded-xl hover:bg-accent transition-all text-xs uppercase tracking-widest font-bold"
            >
              Add Type
            </button>
          </div>
        </motion.div>
      </div>

      {/* Dynamic Preview Box */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 p-10 bg-[#0a0a0a] text-white rounded-[2rem] shadow-2xl overflow-hidden relative"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h4 className="font-serif text-3xl mb-1">Maison Ledger Preview</h4>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-sans">Simulated customer billing experience</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-white/60">Cart Quantity:</span>
              <div className="flex items-center gap-3">
                <span className="text-accent font-mono">2 Items</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="border-l border-white/10 pl-6">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Subtotal</p>
              <p className="text-xl font-mono">Rs. 10,000</p>
            </div>
            <div className="border-l border-white/10 pl-6">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Tax ({taxPercentage}%)</p>
              <p className="text-xl font-mono text-white/80">Rs. {(10000 * (taxPercentage / 100)).toLocaleString()}</p>
            </div>
            <div className="border-l border-white/10 pl-6">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Tiered Shipping</p>
              <p className="text-xl font-mono text-white/80">Rs. {(baseShipping + incrementalShipping).toLocaleString()}</p>
            </div>
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-accent font-bold mb-2">Final Payable</p>
              <p className="text-2xl font-mono text-accent">Rs. {(10000 + (10000 * (taxPercentage / 100)) + baseShipping + incrementalShipping).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/10 blur-[100px] rounded-full" />
      </motion.div>
    </div>
  );
}

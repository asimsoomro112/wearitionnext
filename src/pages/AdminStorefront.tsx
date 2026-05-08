import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export interface StoreSection {
  id: string;
  type: 'products_scroll' | 'categories' | 'hero' | 'editorial' | 'artisanship' | 'newsletter';
  title?: string;
  productQueryType?: 'trending' | 'sale' | 'category' | 'all';
  categoryValue?: string;
  items?: any[]; // for Categories
}

const DEFAULT_SECTIONS: StoreSection[] = [
  { id: '1', type: 'hero' },
  { 
    id: '2', type: 'categories', title: 'Categories',
    items: [
      { name: 'Womens', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop', link: '/shop?category=womens' },
      { name: 'Mens', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop', link: '/shop?category=mens' },
      { name: 'Accessories', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop', link: '/shop?category=accessories' },
      { name: 'Collections', image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=800&auto=format&fit=crop', link: '/shop?category=collections' },
    ]
  },
  { id: '3', type: 'products_scroll', title: 'Trending Now', productQueryType: 'trending' },
  { id: '4', type: 'editorial' },
  { id: '5', type: 'products_scroll', title: 'End of Season Sale', productQueryType: 'sale' },
  { id: '6', type: 'artisanship' },
  { id: '7', type: 'newsletter' },
];

export function AdminStorefront() {
  const [sections, setSections] = useState<StoreSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'settings', 'homepage');
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().sections) {
          setSections(snap.data().sections);
        } else {
          setSections(DEFAULT_SECTIONS);
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, 'settings/homepage');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'homepage'), { sections });
      toast.success('Storefront layout saved successfully');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/homepage');
      toast.error('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;
    setSections(newSections);
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;
    setSections(newSections);
  };

  const removeSection = (index: number) => {
    if (window.confirm("Are you sure you want to remove this section?")) {
       setSections(sections.filter((_, i) => i !== index));
    }
  };

  const addProductScrollSection = () => {
    const newSection: StoreSection = {
      id: Date.now().toString(),
      type: 'products_scroll',
      title: 'New Section',
      productQueryType: 'all'
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (index: number, updates: Partial<StoreSection>) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updates };
    setSections(newSections);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-background">Storefront Layout</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-background text-foreground px-6 py-2 rounded flex items-center gap-2 hover:bg-background/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Layout'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-black/10 p-6 mb-8 shadow-sm">
        <p className="text-sm text-background/60 mb-6">
          Drag or move sections up and down to change their order on the homepage.
        </p>

        <div className="flex flex-col gap-4">
          {sections.map((section, idx) => (
            <motion.div 
              layout 
              key={section.id} 
              className="border border-black/10 rounded-md p-4 bg-gray-50 flex items-center gap-4"
            >
              <div className="flex flex-col gap-1">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 hover:bg-black/5 rounded disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => moveDown(idx)} disabled={idx === sections.length - 1} className="p-1 hover:bg-black/5 rounded disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
              </div>

              <div className="flex-grow flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="uppercase text-xs font-bold tracking-widest text-background/60 bg-black/5 px-2 py-1 rounded">
                    {section.type.replace('_', ' ')}
                  </span>
                  {!['hero', 'editorial', 'artisanship', 'newsletter', 'categories'].includes(section.type) && (
                    <button onClick={() => removeSection(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {section.type === 'products_scroll' && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="text-xs font-medium text-background/70 mb-1 block">Section Title</label>
                      <input 
                        type="text" 
                        value={section.title || ''} 
                        onChange={(e) => updateSection(idx, { title: e.target.value })}
                        className="w-full text-sm border border-black/10 rounded p-2 focus:outline-none focus:border-background text-background"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-background/70 mb-1 block">Show Products By</label>
                      <select 
                        value={section.productQueryType || 'all'}
                        onChange={(e) => updateSection(idx, { productQueryType: e.target.value as any, categoryValue: '' })}
                        className="w-full text-sm border border-black/10 rounded p-2 focus:outline-none focus:border-background text-background"
                      >
                        <option value="all">All Products</option>
                        <option value="trending">Trending (Random/Popular)</option>
                        <option value="sale">On Sale (Discounted items)</option>
                        <option value="category">Specific Category</option>
                      </select>
                    </div>
                    {section.productQueryType === 'category' && (
                      <div className="col-span-2">
                       <label className="text-xs font-medium text-background/70 mb-1 block">Category Slug (e.g., womens, outerwear)</label>
                       <input 
                         type="text" 
                         value={section.categoryValue || ''} 
                         onChange={(e) => updateSection(idx, { categoryValue: e.target.value.toLowerCase() })}
                         className="w-full text-sm border border-black/10 rounded p-2 focus:outline-none focus:border-background text-background"
                       />
                     </div>
                    )}
                  </div>
                )}
                {['hero', 'editorial', 'artisanship', 'newsletter', 'categories'].includes(section.type) && (
                   <p className="text-sm text-background/70 font-medium">Fixed Section (Layout specific)</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-black/10">
          <h3 className="text-lg font-serif mb-4 text-background">Add New Section</h3>
          <button 
            onClick={addProductScrollSection}
            className="flex items-center gap-2 border border-dashed border-black/30 text-background/70 hover:text-background hover:border-background hover:bg-black/5 px-6 py-4 rounded-md transition-all font-medium text-sm w-full justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Product Scroll Section
          </button>
        </div>
      </div>
    </div>
  );
}

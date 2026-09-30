"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, deleteDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { getOptimizedImage } from '../lib/images';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  brand: string;
  description?: string;
  price: number;
  stock: number;
  sizes?: string[];
  images: string[];
  category: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isUnstitched?: boolean;
  colors?: string[];
  colorImages?: Record<string, string[]>;
  createdAt?: any;
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sizes, setSizes] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState(''); // comma separated
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUnstitched, setIsUnstitched] = useState(false);
  const [colors, setColors] = useState('');
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, colorKey?: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          return data.url;
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      if (colorKey) {
        setColorImages(prev => ({
          ...prev,
          [colorKey]: [...(prev[colorKey] || []), ...uploadedUrls]
        }));
      } else {
        setImages((prev) => (prev ? `${prev}, ${uploadedUrls.join(', ')}` : uploadedUrls.join(', ')));
      }
      toast.success(`${files.length} images uploaded successfully to Cloudinary`);
    } catch (err: any) {
      console.error(err);
      toast.error('Error uploading images: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(items);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      title,
      brand,
      description,
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      sizes: isUnstitched ? [] : sizes.split(',').map(s => s.trim()).filter(Boolean),
      images: images.split(',').map(img => img.trim()).filter(Boolean),
      category,
      isPublished,
      isFeatured,
      isUnstitched,
      colors: colors.split(',').map(c => c.trim()).filter(Boolean),
      colorImages,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        toast.success('Product updated successfully');
      } else {
        const newProductRef = doc(collection(db, 'products'));
        await setDoc(newProductRef, {
          ...productData,
          createdAt: serverTimestamp(),
        });
        toast.success('Product created successfully');

        // --- AUTOMATIC SYNC TO PRELOVED MARKETPLACE ---
        try {
          fetch('/api/sync-preloved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
          }).then(res => res.json()).then(syncData => {
            if (syncData.success) {
              toast.info('Synced to Preloved Marketplace as PENDING');
            }
          }).catch(e => console.error('Sync failed:', e));
        } catch (syncErr) {
          console.error('Sync process error:', syncErr);
        }
      }
      resetForm();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Error saving product: ' + err.message);
    }
  };

  const resetForm = () => {
    setTitle('');
    setBrand('');
    setDescription('');
    setPrice('');
    setStock('');
    setSizes('');
    setCategory('');
    setImages('');
    setIsPublished(true);
    setIsFeatured(false);
    setIsUnstitched(false);
    setColors('');
    setColorImages({});
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setBrand(product.brand || '');
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setSizes(product.sizes?.join(', ') || '');
    setCategory(product.category);
    setImages(product.images.join(', '));
    setIsPublished(product.isPublished ?? true);
    setIsFeatured(product.isFeatured ?? false);
    setIsUnstitched(product.isUnstitched ?? false);
    setColors(product.colors?.join(', ') || '');
    setColorImages(product.colorImages || {});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Product deleted successfully');
      } catch (err: any) {
        console.error(err);
        toast.error('Error deleting product: ' + err.message);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-full relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-black/10 gap-4">
        <div className="flex items-center gap-6 flex-1 max-w-xl">
          <h1 className="text-2xl md:text-3xl font-serif text-foreground whitespace-nowrap">Products</h1>
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search products, brands or categories..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-black/5 border border-transparent focus:border-black/10 focus:bg-white px-12 py-3 rounded-xl text-sm outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-foreground text-background px-8 py-3.5 text-[10px] uppercase tracking-widest hover:bg-accent transition-colors rounded-full font-bold shadow-lg whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-black/10 rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-[#fcfcfc] border-b border-black/10 text-[10px] uppercase tracking-widest text-[#0a0a0a]/60">
            <tr>
              <th className="font-bold p-6">Product</th>
              <th className="font-bold p-6">Brand</th>
              <th className="font-bold p-6">Price</th>
              <th className="font-bold p-6">Stock</th>
              <th className="font-bold p-6">Status</th>
              <th className="font-bold p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filteredProducts.map((item) => (
              <tr key={item.id} className="hover:bg-black/[0.01] transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-black/5 rounded-sm flex-shrink-0 overflow-hidden">
                      {item.images && item.images.length > 0 && (
                        <img src={getOptimizedImage(item.images[0])} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#0a0a0a] text-sm mb-0.5">{item.title}</p>
                      <p className="text-[10px] uppercase tracking-widest text-[#0a0a0a]/40">{item.category}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-sm text-[#0a0a0a]/70">{item.brand}</td>
                <td className="p-6 text-sm font-mono text-[#0a0a0a]">{formatCurrency(item.price)}</td>
                <td className="p-6 text-sm text-[#0a0a0a]/70">{item.stock}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${item.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="p-2.5 rounded-full border border-black/10 hover:bg-black/5 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-[#0a0a0a]" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 rounded-full border border-red-100 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[#0a0a0a]/40 uppercase tracking-widest text-xs">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-white border-b border-black/10 px-8 py-6 flex items-center justify-between">
              <h2 className="text-xl font-serif text-[#0a0a0a]">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-grow flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/60 font-bold">Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="border-b border-black/10 py-2 focus:outline-none focus:border-black text-[#0a0a0a] bg-transparent" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/60 font-bold">Brand *</label>
                  <input type="text" required value={brand} onChange={e => setBrand(e.target.value)} className="border-b border-black/10 py-2 focus:outline-none focus:border-black text-[#0a0a0a] bg-transparent" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/60 font-bold">Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="border border-black/10 rounded-md p-4 focus:outline-none focus:border-black resize-none text-[#0a0a0a] text-sm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/60 font-bold">Price (PKR) *</label>
                  <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="border-b border-black/10 py-2 focus:outline-none focus:border-black text-[#0a0a0a] bg-transparent font-mono" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/60 font-bold">Stock *</label>
                  <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="border-b border-black/10 py-2 focus:outline-none focus:border-black text-[#0a0a0a] bg-transparent font-mono" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/60 font-bold">Category *</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="border-b border-black/10 py-2 focus:outline-none focus:border-black bg-transparent text-[#0a0a0a]">
                    <option value="" disabled>Select category</option>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="shirts">Shirts</option>
                    <option value="pants">Pants</option>
                    <option value="tech-noir">Tech-Noir</option>
                    <option value="accessories">Accessories</option>
                    <option value="shoes">Shoes</option>
                    <option value="jewelry">Jewelry</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  <input 
                    type="checkbox" 
                    id="isUnstitched" 
                    checked={isUnstitched} 
                    onChange={e => setIsUnstitched(e.target.checked)} 
                    className="w-5 h-5 accent-foreground rounded-full" 
                  />
                  <label htmlFor="isUnstitched" className="text-[10px] uppercase tracking-widest text-[#0a0a0a]/60 font-bold">Unstitched Fabric (No Sizes)</label>
                </div>
                {!isUnstitched && (
                  <>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/60 font-bold">Sizes (comma separated)</label>
                    <input type="text" value={sizes} onChange={e => setSizes(e.target.value)} placeholder="S, M, L, XL" className="border-b border-black/10 py-2 focus:outline-none focus:border-black text-[#0a0a0a] bg-transparent" />
                  </>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/60 font-bold">Colors (comma separated)</label>
                <input type="text" value={colors} onChange={e => setColors(e.target.value)} placeholder="Black, Navy, Emerald" className="border-b border-black/10 py-2 focus:outline-none focus:border-black text-[#0a0a0a] bg-transparent" />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/60 font-bold">Product Images</label>
                <div className="relative">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <label 
                    htmlFor="image-upload"
                    className={`cursor-pointer flex items-center justify-center gap-3 w-full border-2 border-dashed border-black/10 py-8 rounded-xl hover:border-black/20 hover:bg-black/[0.02] transition-all ${isUploading ? 'opacity-50' : ''}`}
                  >
                    <Plus className="w-5 h-5 text-foreground/40" />
                    <span className="text-xs uppercase tracking-widest font-bold text-foreground/60">{isUploading ? 'Uploading...' : 'Upload to Cloudinary'}</span>
                  </label>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-2">
                  {images.split(',').map(img => img.trim()).filter(Boolean).map((url, i) => (
                    <div key={i} className="relative w-24 h-32 group border border-black/5 rounded-lg overflow-visible bg-black/[0.02]">
                      <img src={getOptimizedImage(url)} alt="" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                      <button 
                        type="button"
                        onClick={() => {
                          const current = images.split(',').map(img => img.trim()).filter(Boolean);
                          const updated = current.filter((_, idx) => idx !== i);
                          setImages(updated.join(', '));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <label className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/60 font-bold mt-4">Raw URLs (Internal Use)</label>
                <textarea 
                  rows={2} 
                  value={images} 
                  onChange={e => setImages(e.target.value)} 
                  className="border border-black/5 rounded-md p-3 focus:outline-none bg-black/[0.01] text-[8px] font-mono text-[#0a0a0a]/40" 
                />
              </div>

              {/* Color Specific Images */}
              {colors.split(',').map(c => c.trim()).filter(Boolean).map(color => (
                <div key={color} className="flex flex-col gap-4 mt-2 p-6 border border-black/5 rounded-2xl bg-black/[0.01]">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/60 font-bold">
                    Images for {color}
                  </label>
                  <input
                    type="file"
                    id={`image-upload-${color}`}
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, color)}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <label 
                    htmlFor={`image-upload-${color}`}
                    className="cursor-pointer flex items-center justify-center gap-2 border border-black/10 py-3 rounded-lg text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-all"
                  >
                    {isUploading ? 'Uploading...' : `Add ${color} Images`}
                  </label>
                  
                  {colorImages[color] && colorImages[color].length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {colorImages[color].map((url, i) => (
                        <div key={i} className="relative w-16 h-20 group rounded-md overflow-visible bg-white shadow-sm">
                          <img src={getOptimizedImage(url)} alt="" className="w-full h-full object-cover rounded-md" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => {
                              setColorImages(prev => ({
                                ...prev,
                                [color]: prev[color].filter((_, idx) => idx !== i)
                              }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg z-20"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-8 mb-8">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isPublished" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="w-5 h-5 accent-foreground rounded-full" />
                  <label htmlFor="isPublished" className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/60">Published</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-accent rounded-full" />
                  <label htmlFor="isFeatured" className="text-xs font-bold uppercase tracking-widest text-accent">Featured</label>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-black/10 flex justify-end gap-6 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] uppercase tracking-widest font-bold text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="bg-[#0a0a0a] text-white px-12 py-4 rounded-full uppercase text-[10px] tracking-[0.2em] font-bold hover:bg-accent transition-all shadow-xl disabled:opacity-50 transform hover:-translate-y-1"
                >
                  {editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

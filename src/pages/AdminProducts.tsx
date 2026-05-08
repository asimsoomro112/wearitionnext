import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, deleteDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
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
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey || apiKey === 'YOUR_IMGBB_API_KEY') {
        alert('Please configure VITE_IMGBB_API_KEY in your .env file or settings.');
        setIsUploading(false);
        return;
      }

      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          return data.data.url;
        } else {
          throw new Error(data.error?.message || 'Unknown error');
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
    } catch (err: any) {
      console.error(err);
      alert('Error uploading images: ' + err.message);
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

  const openAddModal = () => {
    setEditingId(null);
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
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setTitle(p.title);
    setBrand(p.brand || '');
    setDescription(p.description || '');
    setPrice(p.price.toString());
    setStock((p.stock ?? 0).toString());
    setSizes(p.sizes ? p.sizes.join(', ') : '');
    setCategory(p.category);
    setImages(p.images ? p.images.join(', ') : '');
    setIsPublished(p.isPublished ?? true);
    setIsFeatured(p.isFeatured ?? false);
    setIsUnstitched(p.isUnstitched ?? false);
    setColors(p.colors ? p.colors.join(', ') : '');
    setColorImages(p.colorImages || {});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      if (confirm('Are you sure you want to delete this product?')) {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Product deleted');
      }
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast.error('Error deleting product');
    }
  };

  const handleReseed = async () => {
    if (!confirm('This will DELETE all current products and replace them with the 2026 Luxury Collection. Are you sure?')) return;
    
    try {
      // 1. Delete all
      for (const p of products) {
        await deleteDoc(doc(db, 'products', p.id));
      }
      
      // 2. Add New
      const LUXURY_PRODUCTS = [
        {
          title: "Sculpted Silk Gown",
          brand: "WEARITION",
          description: "Architectural precision meets fluid silk. A 2026 signature silhouette.",
          price: 850,
          stock: 12,
          sizes: ["XS", "S", "M", "L"],
          images: ["https://images.unsplash.com/photo-1539008835657-9e8e9680fe0a?q=80&w=800"],
          category: "women",
          isPublished: true,
        },
        {
          title: "Double-Faced Cashmere Blazer",
          brand: "WEARITION",
          description: "The essence of quiet luxury. Hand-stitched finishing and ultra-soft feel.",
          price: 1200,
          stock: 8,
          sizes: ["S", "M", "L"],
          images: ["https://images.unsplash.com/photo-1591360236480-4ed861025a18?q=80&w=800"],
          category: "women",
          isPublished: true,
        },
        {
          title: "Tech-Noir Utility Overcoat",
          brand: "WEARITION",
          description: "Water-repellent nylon with modular magnetic systems. Future-functional.",
          price: 950,
          stock: 10,
          sizes: ["S", "M", "L", "XL"],
          images: ["https://images.unsplash.com/photo-1550246140-5119ae4790b7?q=80&w=800"],
          category: "men",
          isPublished: true,
        },
        {
          title: "Architectural Wool Suit",
          brand: "WEARITION",
          description: "Sharp shoulders and a streamlined cut. Virgin wool with silk lining.",
          price: 1500,
          stock: 5,
          sizes: ["M", "L", "XL"],
          images: ["https://images.unsplash.com/photo-1536766768598-e09213fdcf22?q=80&w=800"],
          category: "men",
          isPublished: true,
        }
      ];

      for (const product of LUXURY_PRODUCTS) {
        const newRef = doc(collection(db, 'products'));
        await setDoc(newRef, {
          ...product,
          createdAt: serverTimestamp()
        });
      }
      alert('Reseed successful!');
    } catch (err: any) {
      alert('Error during reseed: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      title,
      brand,
      description,
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 0,
      category,
      sizes: isUnstitched ? [] : sizes.split(',').map(s => s.trim()).filter(Boolean),
      images: images.split(',').map(img => img.trim()).filter(Boolean),
      isPublished,
      isFeatured,
      isUnstitched,
      colors: colors.split(',').map(c => c.trim()).filter(Boolean),
      colorImages
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
      } else {
        const newRef = doc(collection(db, 'products'));
        await setDoc(newRef, {
          ...productData,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      toast.success(editingId ? 'Product updated' : 'Product created');
    } catch (err: any) {
      console.error('Save failed:', err);
      toast.error('Error saving product');
    }
  };

  return (
    <div className="max-w-full relative">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/10">
        <h1 className="text-2xl md:text-3xl font-serif">Products</h1>
        <div className="flex gap-4">
          <button 
            onClick={handleReseed}
            className="flex items-center gap-2 border border-black/10 px-4 py-2 text-xs uppercase tracking-wider hover:bg-black/5 transition-colors"
          >
            Reseed Luxury 2026
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm uppercase tracking-wider hover:bg-accent transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-black/10 rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-[#fcfcfc] border-b border-black/10 text-sm text-[#0a0a0a]/60">
            <tr>
              <th className="font-medium p-4">Product Name</th>
              <th className="font-medium p-4">Brand</th>
              <th className="font-medium p-4">Price</th>
              <th className="font-medium p-4">Stock</th>
              <th className="font-medium p-4">Status</th>
              <th className="font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {products.map((item) => (
              <tr key={item.id} className="hover:bg-black/[0.02] border-b border-black/5 last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black/5 rounded flex-shrink-0 overflow-hidden">
                      {item.images && item.images.length > 0 && (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="font-medium text-[#0a0a0a] break-words overflow-hidden line-clamp-2 max-w-[200px]">{item.title}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-[#0a0a0a]/70 max-w-[120px] truncate">{item.brand}</td>
                <td className="p-4 text-sm font-mono text-[#0a0a0a]">{formatCurrency(item.price)}</td>
                <td className="p-4 text-sm text-[#0a0a0a]/70">{item.stock}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${item.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="text-sm border border-black/20 p-2 rounded hover:bg-black/5 transition-colors text-[#0a0a0a]"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-sm border border-red-200 text-red-600 p-2 rounded hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#0a0a0a]/60">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white border-b border-black/10 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-serif text-[#0a0a0a]">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-foreground text-[#0a0a0a]" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Brand *</label>
                  <input type="text" required value={brand} onChange={e => setBrand(e.target.value)} className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-foreground text-[#0a0a0a]" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Description</label>
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-foreground resize-none text-[#0a0a0a]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Price (PKR) *</label>
                  <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-foreground text-[#0a0a0a]" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Stock *</label>
                  <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-foreground text-[#0a0a0a]" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Category *</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-foreground bg-transparent text-[#0a0a0a]">
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
                <div className="flex items-center gap-3 mb-1">
                  <input 
                    type="checkbox" 
                    id="isUnstitched" 
                    checked={isUnstitched} 
                    onChange={e => setIsUnstitched(e.target.checked)} 
                    className="w-5 h-5 accent-foreground" 
                  />
                  <label htmlFor="isUnstitched" className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-bold">Unstitched Fabric (No Sizes)</label>
                </div>
                {!isUnstitched && (
                  <>
                    <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Sizes (comma separated)</label>
                    <input type="text" value={sizes} onChange={e => setSizes(e.target.value)} placeholder="S, M, L, XL" className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-foreground text-[#0a0a0a]" />
                  </>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Colors (comma separated)</label>
                <input type="text" value={colors} onChange={e => setColors(e.target.value)} placeholder="Black, Navy, Emerald" className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-foreground text-[#0a0a0a]" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Images</label>
                <div className="flex items-center gap-4 mb-2">
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
                      className="cursor-pointer flex items-center gap-2 bg-black/5 text-[#0a0a0a] px-4 py-2 rounded-md text-sm font-medium hover:bg-black/10 transition-colors"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Images'}
                    </label>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  {images.split(',').map(img => img.trim()).filter(Boolean).map((url, i) => (
                    <div key={i} className="relative w-28 h-32 group border border-black/10 rounded-lg overflow-visible bg-black/[0.02]">
                      <img src={url} alt="" className="w-full h-full object-contain rounded p-1" />
                      
                      {/* Remove Button */}
                      <button 
                        type="button"
                        onClick={() => {
                          const current = images.split(',').map(img => img.trim()).filter(Boolean);
                          const updated = current.filter((_, idx) => idx !== i);
                          setImages(updated.join(', '));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-20"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Reorder Buttons */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        {i > 0 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const current = images.split(',').map(img => img.trim()).filter(Boolean);
                              [current[i-1], current[i]] = [current[i], current[i-1]];
                              setImages(current.join(', '));
                            }}
                            className="bg-black text-white text-[8px] px-2 py-1 rounded"
                          >
                            ←
                          </button>
                        )}
                        {i < images.split(',').map(img => img.trim()).filter(Boolean).length - 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const current = images.split(',').map(img => img.trim()).filter(Boolean);
                              [current[i], current[i+1]] = [current[i+1], current[i]];
                              setImages(current.join(', '));
                            }}
                            className="bg-black text-white text-[8px] px-2 py-1 rounded"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Image URLs (comma separated) *</label>
                <textarea 
                  rows={3} 
                  required 
                  value={images} 
                  onChange={e => setImages(e.target.value)} 
                  placeholder="https://..., https://..." 
                  className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-foreground resize-none text-[#0a0a0a] w-full text-xs font-mono" 
                />
              </div>

              {/* Color Specific Images */}
              {colors.split(',').map(c => c.trim()).filter(Boolean).map(color => (
                <div key={color} className="flex flex-col gap-2 mt-2 p-4 border border-black/10 rounded-lg bg-black/[0.02]">
                  <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">
                    Images for {color}
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="relative">
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
                        className="cursor-pointer flex items-center gap-2 bg-white text-[#0a0a0a] px-4 py-2 rounded-md text-sm font-medium border border-black/10 hover:bg-black/5 transition-colors"
                      >
                        {isUploading ? 'Uploading...' : `Upload ${color} Images`}
                      </label>
                    </div>
                  </div>
                  
                  {colorImages[color] && colorImages[color].length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {colorImages[color].map((url, i) => (
                        <div key={i} className="relative w-20 h-24 group border border-black/10 rounded-lg overflow-visible bg-white">
                          <img src={url} alt="" className="w-full h-full object-cover rounded p-1" />
                          <button 
                            type="button"
                            onClick={() => {
                              setColorImages(prev => ({
                                ...prev,
                                [color]: prev[color].filter((_, idx) => idx !== i)
                              }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-20"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isPublished" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="w-5 h-5 accent-foreground" />
                  <label htmlFor="isPublished" className="text-sm font-medium text-[#0a0a0a]">Publish immediately</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-accent" />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-[#0a0a0a]">Feature on Homepage</label>
                </div>
              </div>

              <div className="mt-4 pt-6 border-t border-black/10 flex justify-end gap-4 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-medium text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="bg-[#0a0a0a] text-white px-10 py-3 uppercase text-xs tracking-widest font-bold hover:bg-accent transition-colors shadow-lg disabled:opacity-50"
                >
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, doc, deleteDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

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
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey || apiKey === 'YOUR_IMGBB_API_KEY') {
        alert('Please configure VITE_IMGBB_API_KEY in your .env file or settings.');
        setIsUploading(false);
        return;
      }

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        const imageUrl = data.data.url;
        setImages((prev) => (prev ? `${prev}, ${imageUrl}` : imageUrl));
      } else {
        alert('Image upload failed: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Error uploading image: ' + err.message);
    } finally {
      setIsUploading(false);
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
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      if (confirm('Are you sure you want to delete this product?')) {
        await deleteDoc(doc(db, 'products', id));
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      alert('Error deleting product');
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
      sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
      images: images.split(',').map(img => img.trim()).filter(Boolean),
      isPublished,
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
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `products`);
      alert('Error saving product');
    }
  };

  return (
    <div className="max-w-full relative">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/10">
        <h1 className="text-2xl md:text-3xl font-serif">Products</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm uppercase tracking-wider hover:bg-accent transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
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
                    <option value="clothing">Clothing</option>
                    <option value="accessories">Accessories</option>
                    <option value="shoes">Shoes</option>
                    <option value="jewelry">Jewelry</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Sizes (comma separated)</label>
                <input type="text" value={sizes} onChange={e => setSizes(e.target.value)} placeholder="S, M, L, XL" className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-foreground text-[#0a0a0a]" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Images</label>
                <div className="flex items-center gap-4 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black/5 file:text-[#0a0a0a] hover:file:bg-black/10 transition-colors"
                  />
                  {isUploading && <span className="text-sm text-[#0a0a0a]/60">Uploading...</span>}
                </div>
                <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Image URLs (comma separated) *</label>
                <textarea rows={3} required value={images} onChange={e => setImages(e.target.value)} placeholder="https://..., https://..." className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-foreground resize-none text-[#0a0a0a]" />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="isPublished" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="w-5 h-5 accent-foreground" />
                <label htmlFor="isPublished" className="text-sm font-medium text-[#0a0a0a]">Publish immediately</label>
              </div>

              <div className="mt-4 pt-6 border-t border-black/10 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-medium text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-foreground text-background px-8 py-3 uppercase text-xs tracking-widest font-medium hover:bg-accent transition-colors">
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

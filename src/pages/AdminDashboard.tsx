import { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, query } from 'firebase/firestore';
import { formatCurrency } from '../utils/currency';

export function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Listen to all products
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => unsubscribe();
  }, []);

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "products", id), {
        isPublished: !currentStatus
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `products/${id}`);
    }
  };

  return (
    <div className="max-w-full">
      <h1 className="text-2xl md:text-3xl font-serif mb-2 border-b border-black/10 pb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-8 mb-12">
        <div className="bg-white border border-black/10 p-6 rounded-lg shadow-sm">
          <p className="text-background/50 text-sm mb-2">Total Revenue</p>
          <p className="text-3xl font-mono">{formatCurrency(12450)}</p>
        </div>
        <div className="bg-white border border-black/10 p-6 rounded-lg shadow-sm">
          <p className="text-background/50 text-sm mb-2">Orders</p>
          <p className="text-3xl font-mono">142</p>
        </div>
        <div className="bg-white border border-black/10 p-6 rounded-lg shadow-sm">
          <p className="text-background/50 text-sm mb-2">Products</p>
          <p className="text-3xl font-mono">{products.length}</p>
        </div>
      </div>

      <h2 className="text-xl font-medium mb-6">Inventory Management</h2>
      <div className="bg-white border border-black/10 rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-[#fcfcfc] border-b border-black/10 text-sm text-background/60">
            <tr>
              <th className="font-medium p-4">Product</th>
              <th className="font-medium p-4">Price</th>
              <th className="font-medium p-4">Category</th>
              <th className="font-medium p-4">Status</th>
              <th className="font-medium p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b border-black/5 last:border-0 hover:bg-background-secondary/[0.02]">
                <td className="p-4 flex items-center gap-4">
                  {product.images && product.images[0] && (
                    <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded bg-background-secondary/5" />
                  )}
                  <span className="font-medium text-sm">{product.title}</span>
                </td>
                <td className="p-4 text-sm font-mono">{formatCurrency(product.price)}</td>
                <td className="p-4 text-sm">{product.category}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${product.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {product.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => togglePublish(product.id, product.isPublished)}
                    className="text-xs border border-black/20 px-3 py-1 rounded hover:bg-background-secondary/5 transition-colors whitespace-nowrap"
                  >
                    Toggle Publish
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-background/40">No products found. Use Telegram Bot to upload.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

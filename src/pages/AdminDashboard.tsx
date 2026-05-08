import { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { formatCurrency } from '../utils/currency';
import { ShoppingBag, Users, DollarSign, Package, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to products
    const qProducts = query(collection(db, "products"));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to recent orders
    const qOrders = query(collection(db, "orders"), orderBy("date", "desc"), limit(5));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const activeOrders = orders.filter(o => o.status !== 'delivered').length;

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "products", id), { isPublished: !currentStatus });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `products/${id}`);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading Dashboard...</div>;

  return (
    <div className="max-w-full">
      <div className="flex justify-between items-center mb-8 border-b border-black/10 pb-6">
        <h1 className="text-2xl md:text-3xl font-serif">Overview</h1>
        <Link to="/" target="_blank" className="text-xs uppercase tracking-widest flex items-center gap-2 hover:text-accent transition-colors">
          View Live Site <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        <div className="bg-white border border-black/10 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-md"><DollarSign className="w-5 h-5" /></div>
            <p className="text-[#0a0a0a]/60 text-xs uppercase tracking-widest font-bold">Revenue</p>
          </div>
          <p className="text-2xl font-mono text-[#0a0a0a]">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white border border-black/10 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-md"><ShoppingBag className="w-5 h-5" /></div>
            <p className="text-[#0a0a0a]/60 text-xs uppercase tracking-widest font-bold">Total Orders</p>
          </div>
          <p className="text-2xl font-mono text-[#0a0a0a]">{orders.length}</p>
        </div>
        <div className="bg-white border border-black/10 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-md"><Package className="w-5 h-5" /></div>
            <p className="text-[#0a0a0a]/60 text-xs uppercase tracking-widest font-bold">Inventory</p>
          </div>
          <p className="text-2xl font-mono text-[#0a0a0a]">{products.length}</p>
        </div>
        <div className="bg-white border border-black/10 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-md"><Users className="w-5 h-5" /></div>
            <p className="text-[#0a0a0a]/60 text-xs uppercase tracking-widest font-bold">Customers</p>
          </div>
          <p className="text-2xl font-mono text-[#0a0a0a]">3</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Recent Orders */}
        <div className="bg-white border border-black/10 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b border-black/10 flex justify-between items-center">
            <h3 className="font-serif text-lg text-[#0a0a0a]">Recent Orders</h3>
            <Link to="/admin/orders" className="text-[10px] uppercase tracking-widest text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-black/5">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-black/[0.01]">
                    <td className="p-4 text-xs font-mono text-[#0a0a0a]">{order.orderId}</td>
                    <td className="p-4 text-xs text-[#0a0a0a]/70">{order.email}</td>
                    <td className="p-4 text-xs font-mono text-[#0a0a0a]">{formatCurrency(order.total)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[9px] uppercase font-bold ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Quick Status */}
        <div className="bg-white border border-black/10 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b border-black/10 flex justify-between items-center">
            <h3 className="font-serif text-lg text-[#0a0a0a]">Inventory Status</h3>
            <Link to="/admin/products" className="text-[10px] uppercase tracking-widest text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors">Manage</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-black/5">
                {products.slice(0, 5).map(product => (
                  <tr key={product.id} className="hover:bg-black/[0.01]">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-black/5 rounded overflow-hidden">
                        {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="text-xs font-medium text-[#0a0a0a] truncate max-w-[120px]">{product.title}</span>
                    </td>
                    <td className="p-4 text-xs font-mono text-[#0a0a0a]">{formatCurrency(product.price)}</td>
                    <td className="p-4 text-xs text-[#0a0a0a]/70">{product.stock} in stock</td>
                    <td className="p-4 text-right">
                      <button onClick={() => togglePublish(product.id, product.isPublished)} className="text-[10px] uppercase tracking-widest font-bold text-[#0a0a0a]/40 hover:text-[#0a0a0a]">
                        {product.isPublished ? 'Draft' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

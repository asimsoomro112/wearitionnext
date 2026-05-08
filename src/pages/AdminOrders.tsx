import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { formatCurrency } from '../utils/currency';
import { sendEmailNotification } from '../utils/emailService';
import { toast } from 'sonner';

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetched);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, email: string, orderId: string, newStatus: any) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
      await sendEmailNotification(email, newStatus, { orderId });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `orders/${id}`);
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-12 text-center text-background/60">Loading orders...</div>;

  return (
    <div className="max-w-full">
      <h1 className="text-2xl md:text-3xl font-serif mb-8 pb-6 border-b border-black/10">Order Management</h1>
      
      <div className="bg-white border border-black/10 rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-[#fcfcfc] border-b border-black/10 text-sm text-background/60">
            <tr>
              <th className="font-medium p-4">Order ID</th>
              <th className="font-medium p-4">Date</th>
              <th className="font-medium p-4">Customer</th>
              <th className="font-medium p-4">Items</th>
              <th className="font-medium p-4">Total</th>
              <th className="font-medium p-4">Status</th>
              <th className="font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-black/[0.02] border-b border-black/5 last:border-0">
                <td className="p-4 text-xs font-mono font-bold text-background">{order.orderId}</td>
                <td className="p-4 text-sm text-background/60">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td className="p-4">
                   <div className="text-sm font-medium">{order.email}</div>
                   <div className="text-[10px] uppercase text-background/40">{order.paymentMethod}</div>
                </td>
                <td className="p-4 text-sm">
                  <div className="max-w-[200px] truncate">
                    {order.items?.map((item: any) => `${item.quantity}x ${item.title}`).join(', ')}
                  </div>
                </td>
                <td className="p-4 text-sm font-mono font-bold">{formatCurrency(order.total)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, order.email, order.orderId, e.target.value)}
                    className="text-xs bg-white border border-black/10 rounded px-2 py-2 focus:outline-none focus:border-background"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="p-12 text-center text-background/40">No orders found in the system.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

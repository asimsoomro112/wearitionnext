"use client";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, writeBatch, increment } from 'firebase/firestore';
import { formatCurrency } from '@/lib/currency';
import { sendOrderStatusEmail } from '@/lib/emailService';
import { toast } from 'sonner';
import { Truck, X } from 'lucide-react';

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Shipping modal state
  const [shippingModal, setShippingModal] = useState<{ orderId: string; docId: string; email: string; } | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Orders Page Load Error:", error);
      // Fallback: try without sorting if index is missing
      const qFallback = query(collection(db, 'orders'));
      onSnapshot(qFallback, (snapshot) => {
         setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
         setLoading(false);
      }, (err2) => {
         console.error("Orders Fallback Error:", err2);
         setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (docId: string, email: string, orderId: string, newStatus: string) => {
    // If changing to "shipped", open the tracking modal
    if (newStatus === 'shipped') {
      setShippingModal({ orderId, docId, email });
      setTrackingNumber('');
      setCourierName('');
      setEstimatedDelivery('');
      return;
    }

    try {
      const order = orders.find(o => o.id === docId);

      // Handle Cancellation Inventory Restore
      if (newStatus === 'cancelled') {
        if (order && order.status !== 'cancelled') {
          const batch = writeBatch(db);
          batch.update(doc(db, 'orders', docId), { status: newStatus });
          // Restore stock
          if (order.items && order.items.length > 0) {
            order.items.forEach((item: any) => {
              if (item.id) {
                batch.update(doc(db, 'products', item.id), { stock: increment(item.quantity) });
              }
            });
          }
          await batch.commit();
        }
      } else {
        await updateDoc(doc(db, 'orders', docId), { status: newStatus });
      }

      toast.success(`Order ${orderId} status updated to ${newStatus}`);
      
      // Send rich branded status email (skip for pending — no change)
      if (newStatus !== 'pending' && newStatus !== 'cancelled') {
        const order = orders.find(o => o.id === docId);
        sendOrderStatusEmail({
          email,
          name: order?.shippingAddress?.name?.split(' ')[0] || 'Valued Customer',
          orderId,
          status: newStatus as 'processing' | 'shipped' | 'delivered',
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to update order status:', e);
      toast.error('Failed to update status');
    }
  };

  const handleShipOrder = async () => {
    if (!shippingModal) return;
    const { docId, email, orderId } = shippingModal;

    try {
      await updateDoc(doc(db, 'orders', docId), { 
        status: 'shipped',
        trackingNumber: trackingNumber || undefined,
        courierName: courierName || undefined,
        estimatedDelivery: estimatedDelivery || undefined,
      });
      toast.success(`Order ${orderId} marked as shipped!`);

      // Send shipped email with tracking details
      sendOrderStatusEmail({
        email,
        name: orders.find(o => o.id === docId)?.shippingAddress?.name?.split(' ')[0] || 'Valued Customer',
        orderId,
        status: 'shipped',
        trackingNumber: trackingNumber || undefined,
        courierName: courierName || undefined,
        estimatedDelivery: estimatedDelivery || undefined,
      }).catch(() => {});

      setShippingModal(null);
    } catch (e) {
      console.error('Failed to ship order:', e);
      toast.error('Failed to update order');
    }
  };

  if (loading) return <div className="p-12 text-center text-[#0a0a0a]/60">Loading orders...</div>;

  return (
    <div className="max-w-full">
      <h1 className="text-2xl md:text-3xl font-serif mb-8 pb-6 border-b border-black/10 text-[#0a0a0a]">Order Management</h1>
      
      <div className="bg-white border border-black/10 rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-[#fcfcfc] border-b border-black/10 text-sm text-[#0a0a0a]/60">
            <tr>
              <th className="font-medium p-4">Order ID</th>
              <th className="font-medium p-4">Date</th>
              <th className="font-medium p-4">Customer</th>
              <th className="font-medium p-4">Items</th>
              <th className="font-medium p-4">Total</th>
              <th className="font-medium p-4">Status</th>
              <th className="font-medium p-4">Tracking</th>
              <th className="font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-black/[0.02] border-b border-black/5 last:border-0">
                <td className="p-4 text-xs font-mono font-bold text-[#0a0a0a]">{order.orderId}</td>
                <td className="p-4 text-sm text-[#0a0a0a]/60">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td className="p-4">
                   <div className="text-sm font-medium text-[#0a0a0a]">{order.email}</div>
                   <div className="text-[10px] uppercase text-[#0a0a0a]/40">{order.paymentMethod}</div>
                </td>
                <td className="p-4 text-sm text-[#0a0a0a]/80">
                  <div className="max-w-[200px] truncate">
                    {order.items?.map((item: any) => `${item.quantity}x ${item.title}`).join(', ')}
                  </div>
                </td>
                <td className="p-4 text-sm font-mono font-bold text-[#0a0a0a]">{formatCurrency(order.total)}</td>
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
                  {order.trackingNumber ? (
                    <div>
                      <div className="text-xs font-mono font-bold text-[#0a0a0a]">{order.trackingNumber}</div>
                      {order.courierName && <div className="text-[10px] text-[#0a0a0a]/40">{order.courierName}</div>}
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#0a0a0a]/30">—</span>
                  )}
                </td>
                <td className="p-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, order.email, order.orderId, e.target.value)}
                    className="text-xs bg-white border border-black/10 rounded px-2 py-2 focus:outline-none focus:border-black text-[#0a0a0a]"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-[#0a0a0a]/40">No orders found in the system.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SHIPPING MODAL — Enter Tracking Number */}
      {shippingModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-serif text-[#0a0a0a]">Ship Order</h2>
              </div>
              <button onClick={() => setShippingModal(null)} className="text-[#0a0a0a]/40 hover:text-[#0a0a0a]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <p className="text-sm text-[#0a0a0a]/60">
                Enter shipping details for order <strong className="text-[#0a0a0a]">{shippingModal.orderId}</strong>. 
                The customer will receive a branded email with tracking info.
              </p>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Tracking Number *</label>
                <input 
                  type="text" 
                  required
                  value={trackingNumber} 
                  onChange={e => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TCS-123456789"
                  className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-[#0a0a0a] text-[#0a0a0a]" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Courier Name</label>
                <select 
                  value={courierName} 
                  onChange={e => setCourierName(e.target.value)}
                  className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-[#0a0a0a] text-[#0a0a0a] bg-white"
                >
                  <option value="">Select Courier</option>
                  <option value="TCS">TCS</option>
                  <option value="Leopards Courier">Leopards Courier</option>
                  <option value="M&P">M&P (Muller & Phipps)</option>
                  <option value="PostEx">PostEx</option>
                  <option value="Rider">Rider</option>
                  <option value="Call Courier">Call Courier</option>
                  <option value="BlueEx">BlueEx</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#0a0a0a]/60 font-medium">Estimated Delivery</label>
                <input 
                  type="text" 
                  value={estimatedDelivery} 
                  onChange={e => setEstimatedDelivery(e.target.value)}
                  placeholder="e.g. 3-5 business days"
                  className="border border-black/10 rounded-md p-3 focus:outline-none focus:border-[#0a0a0a] text-[#0a0a0a]" 
                />
              </div>

              <div className="flex justify-end gap-4 mt-2 pt-4 border-t border-black/10">
                <button 
                  onClick={() => setShippingModal(null)} 
                  className="px-5 py-2 text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleShipOrder}
                  disabled={!trackingNumber.trim()}
                  className="bg-purple-600 text-white px-8 py-2.5 rounded text-xs uppercase tracking-widest font-bold hover:bg-purple-700 transition-colors disabled:opacity-40 flex items-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  Ship Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

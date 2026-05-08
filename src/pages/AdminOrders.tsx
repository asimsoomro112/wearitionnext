import React, { useEffect, useState } from 'react';
import { useOrderTrackingStore } from '../store/orderTrackingStore';
import { formatCurrency } from '../utils/currency';
import { sendEmailNotification } from '../utils/emailService';
import { toast } from 'sonner';

export function AdminOrders() {
  const { orders, updateOrderStatus } = useOrderTrackingStore();

  const handleStatusChange = async (id: string, email: string, newStatus: 'processing' | 'shipped' | 'delivered') => {
    updateOrderStatus(id, newStatus);
    toast.success(`Order ${id} status updated to ${newStatus}`);
    await sendEmailNotification(email, newStatus, { orderId: id });
  };

  return (
    <div className="max-w-full">
      <h1 className="text-2xl md:text-3xl font-serif mb-8 pb-6 border-b border-black/10">Orders</h1>
      
      <div className="bg-white border border-black/10 rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-[#fcfcfc] border-b border-black/10 text-sm text-background/60">
            <tr>
              <th className="font-medium p-4">Order ID</th>
              <th className="font-medium p-4">Date</th>
              <th className="font-medium p-4">Customer</th>
              <th className="font-medium p-4">Total</th>
              <th className="font-medium p-4">Status</th>
              <th className="font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-black/[0.02] border-b border-black/5 last:border-0">
                <td className="p-4 text-sm font-mono text-black/60">{order.id}</td>
                <td className="p-4 text-sm text-black/60">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm font-medium">{order.email}</td>
                <td className="p-4 text-sm font-mono">{formatCurrency(order.total)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                    order.status === 'processing' 
                    ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {order.status || 'processing'}
                  </span>
                </td>
                <td className="p-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, order.email, e.target.value as any)}
                    className="text-sm bg-black/5 border border-black/10 rounded px-2 py-1"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-background/40">No actual orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

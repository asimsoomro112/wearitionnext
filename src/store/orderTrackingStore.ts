import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  id: string;
  email: string;
  status: 'processing' | 'shipped' | 'delivered';
  date: string;
  total: number;
}

interface OrderTrackingState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  getOrder: (id: string, email: string) => Order | undefined;
}

export const useOrderTrackingStore = create<OrderTrackingState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
      })),
      getOrder: (id, email) => get().orders.find(o => o.id === id && o.email.toLowerCase() === email.toLowerCase()),
    }),
    {
      name: 'wearition-orders',
    }
  )
);

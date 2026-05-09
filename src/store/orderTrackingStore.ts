import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

export interface Order {
  id?: string;
  orderId: string;
  email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
  total: number;
  items: any[];
  shippingDetails?: any;
  paymentMethod?: string;
  createdAt?: any;
}

interface OrderTrackingState {
  orders: Order[];
  addOrder: (order: Order) => Promise<string>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  getOrder: (orderId: string) => Promise<Order | undefined>;
  fetchAllOrders: () => Promise<void>;
}

export const useOrderTrackingStore = create<OrderTrackingState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: async (order) => {
        const docRef = await addDoc(collection(db, 'orders'), {
          ...order,
          createdAt: serverTimestamp()
        });
        set((state) => ({ orders: [...state.orders, { ...order, id: docRef.id }] }));
        return docRef.id;
      },
      updateOrderStatus: async (id, status) => {
        const orderRef = doc(db, 'orders', id);
        await updateDoc(orderRef, { status });
        set((state) => ({
          orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
        }));
      },
      getOrder: async (orderId) => {
        // Try searching by custom orderId (WR-XXXX)
        const q = query(
          collection(db, 'orders'), 
          where('orderId', '==', orderId.toUpperCase())
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          return { id: doc.id, ...doc.data() } as Order;
        }

        // Fallback: Try searching by Firestore Document ID directly
        try {
          const docRef = doc(db, 'orders', orderId);
          const docSnap = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)));
          if (!docSnap.empty) {
            const d = docSnap.docs[0];
            return { id: d.id, ...d.data() } as Order;
          }
        } catch (e) {
          // Ignore if docId format is invalid
        }

        return undefined;
      },
      fetchAllOrders: async () => {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        set({ orders: fetchedOrders });
      },
    }),
    {
      name: 'wearition-orders-v2',
    }
  )
);

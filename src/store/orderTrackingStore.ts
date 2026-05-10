import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

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
        if (!orderId) return undefined;
        const cleanId = orderId.trim().toUpperCase();

        try {
          // 1. Try direct document ID lookup first (if it's a Firestore ID)
          const docRef = doc(db, 'orders', orderId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Order;
          }

          // 2. Search by custom orderId field (WR-XXXX)
          const q = query(
            collection(db, 'orders'), 
            where('orderId', '==', cleanId)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const d = querySnapshot.docs[0];
            return { id: d.id, ...d.data() } as Order;
          }
        } catch (e) {
          console.error("Order lookup error:", e);
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

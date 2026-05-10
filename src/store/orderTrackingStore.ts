import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, increment, writeBatch } from 'firebase/firestore';

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
        const orderRef = doc(db, 'orders', order.orderId);
        
        // Use a batch to ensure order is saved AND stock is decremented atomically
        const batch = writeBatch(db);
        
        batch.set(orderRef, {
          ...order,
          createdAt: serverTimestamp()
        });

        // Decrement stock for each item in the order
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            if (item.id) {
              const productRef = doc(db, 'products', item.id);
              batch.update(productRef, {
                stock: increment(-item.quantity)
              });
            }
          });
        }

        await batch.commit();

        set((state) => ({ orders: [...state.orders, { ...order, id: order.orderId }] }));
        return order.orderId;
      },
      updateOrderStatus: async (id, status) => {
        const orderRef = doc(db, 'orders', id);
        
        if (status === 'cancelled') {
          const docSnap = await getDoc(orderRef);
          if (docSnap.exists()) {
            const orderData = docSnap.data();
            if (orderData.status !== 'cancelled') {
              const batch = writeBatch(db);
              batch.update(orderRef, { status });
              
              if (orderData.items && orderData.items.length > 0) {
                orderData.items.forEach((item: any) => {
                  if (item.id) {
                    batch.update(doc(db, 'products', item.id), { stock: increment(item.quantity) });
                  }
                });
              }
              await batch.commit();
            }
          }
        } else {
          await updateDoc(orderRef, { status });
        }

        set((state) => ({
          orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
        }));
      },
      getOrder: async (orderId) => {
        if (!orderId) return undefined;
        const cleanId = orderId.trim();
        const upperId = cleanId.toUpperCase();

        try {
          // 1. Try direct document ID lookup
          const docRef = doc(db, 'orders', cleanId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Order;
          }

          // 2. Search by custom orderId field (try both cases just in case)
          const q = query(
            collection(db, 'orders'), 
            where('orderId', 'in', [cleanId, upperId])
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const d = querySnapshot.docs[0];
            return { id: d.id, ...d.data() } as Order;
          }
        } catch (e) {
          console.error("Order lookup error:", e);
          throw e; // Throw so UI can catch it
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

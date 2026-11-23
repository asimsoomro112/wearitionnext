import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size?: string, color?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
}

// Max units per line item. The server enforces the same cap on order
// creation — the cart matches it so a customer can never build a cart
// the checkout will reject. Larger quantities go through WhatsApp.
const MAX_QTY_PER_LINE = 10;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => set((state) => {
        // Ensure price is a number to prevent calculation bugs
        const price = typeof newItem.price === 'string' ? parseFloat(newItem.price) : newItem.price;
        const processedItem = { ...newItem, price: isNaN(price) ? 0 : price, quantity: Math.min(Math.max(1, newItem.quantity || 1), MAX_QTY_PER_LINE) };

        const existingItem = state.items.find(
          (item) => item.id === processedItem.id && item.size === processedItem.size && item.color === processedItem.color
        );

        if (existingItem) {
          return {
            items: state.items.map((item) =>
              item.id === processedItem.id && item.size === processedItem.size && item.color === processedItem.color
                ? { ...item, quantity: Math.min(item.quantity + processedItem.quantity, MAX_QTY_PER_LINE) }
                : item
            ),
          };
        }
        return { items: [...state.items, processedItem] };
      }),
      removeItem: (id, size, color) => set((state) => ({
        items: state.items.filter(
          (item) => !(item.id === id && item.size === size && item.color === color)
        )
      })),
      updateQuantity: (id, quantity, size, color) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id && item.size === size && item.color === color
            ? { ...item, quantity: Math.min(Math.max(1, quantity), MAX_QTY_PER_LINE) }
            : item
        )
      })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'wearition-cart' }
  )
);

// Helper selector for subtotal calculation
export const getCartSubtotal = (items: CartItem[]) => {
  return items.reduce((total, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return total + (price * item.quantity);
  }, 0);
};

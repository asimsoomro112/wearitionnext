import { create } from 'zustand';

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
  get subtotal(): number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(
      (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
    );
    if (existingItem) {
      return {
        items: state.items.map((item) =>
          item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        ),
      };
    }
    return { items: [...state.items, newItem] };
  }),
  removeItem: (id, size, color) => set((state) => ({
    items: state.items.filter(
      (item) => !(item.id === id && item.size === size && item.color === color)
    )
  })),
  updateQuantity: (id, quantity, size, color) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id && item.size === size && item.color === color
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    )
  })),
  clearCart: () => set({ items: [] }),
  get subtotal() {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));

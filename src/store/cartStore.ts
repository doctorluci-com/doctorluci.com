import { create } from 'zustand';

export interface CartItem {
  id: string;
  nameKey: string; // Translation key for the name
  type: 'digital' | 'physical';
  price: number;
  quantity: number;
}

interface CartState {
  isOpen: boolean;
  items: CartItem[];
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  isOpen: false,
  items: [],
  setIsOpen: (isOpen) => set({ isOpen }),
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return { isOpen: true }; // Just open cart if it already exists
      }
      return { items: [...state.items, item], isOpen: true };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clearCart: () => set({ items: [] }),
}));

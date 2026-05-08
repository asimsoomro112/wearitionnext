import { create } from 'zustand';

interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isDarkMode: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  toggleDarkMode: () => void;
  toggleSearch: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isDarkMode: true,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleDarkMode: () => set((state) => {
    const nextMatch = !state.isDarkMode;
    if (nextMatch) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    return { isDarkMode: nextMatch };
  }),
}));


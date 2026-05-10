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
  initTheme: () => void;
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
    const nextMode = !state.isDarkMode;
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextMode ? 'dark' : 'light');
      localStorage.setItem('wearition-theme', nextMode ? 'dark' : 'light');
    }
    return { isDarkMode: nextMode };
  }),
  initTheme: () => set(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wearition-theme');
      const isDark = saved ? saved === 'dark' : true; // default to dark
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      return { isDarkMode: isDark };
    }
    return { isDarkMode: true };
  }),
}));

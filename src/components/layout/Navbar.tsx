import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, User, Heart, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  const { openCart, openMobileMenu, isDarkMode, toggleDarkMode, toggleSearch } = useUIStore();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 backdrop-blur-md bg-background-secondary/30 border-b border-white/5 text-foreground"
      >
        <div className="flex items-center gap-6">
          <Link to="/shop" className="hidden md:block uppercase text-xs tracking-widest md:hover:opacity-70 transition-opacity">Shop</Link>
          <button className="hidden md:block uppercase text-xs tracking-widest md:hover:opacity-70 transition-opacity">Collections</button>
          
          <button className="md:hidden active:opacity-70" onClick={openMobileMenu}>
            <Menu className="w-6 h-6" />
          </button>
          
          <button onClick={toggleDarkMode} className="md:hover:opacity-70 transition-opacity md:hover:text-accent">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <span className="font-serif text-2xl tracking-widest font-bold uppercase transition-all">Wearition</span>
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          <button className="md:hover:text-accent active:text-accent" onClick={toggleSearch}><Search className="w-5 h-5" /></button>
          <Link to="/account" className="hidden md:block md:hover:text-accent"><User className="w-5 h-5" /></Link>
          <Link to="/wishlist" className="md:hover:text-accent active:text-accent"><Heart className="w-5 h-5" /></Link>
          <button className="relative md:hover:text-accent active:text-accent" onClick={openCart}>
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-foreground text-background text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </motion.header>
      <MobileMenu />
    </>
  );
}

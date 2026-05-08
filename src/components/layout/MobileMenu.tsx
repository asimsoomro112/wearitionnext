import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] bg-background text-foreground flex flex-col pt-24 px-8 pb-12"
        >
          <button 
            onClick={closeMobileMenu} 
            className="absolute top-6 right-6 p-2"
          >
            <X className="w-8 h-8" />
          </button>
          
          <nav className="flex flex-col gap-8 text-3xl font-serif mt-12 mb-auto">
            <Link to="/" onClick={closeMobileMenu} className="hover:text-accent transition-colors">Home</Link>
            <Link to="/shop" onClick={closeMobileMenu} className="hover:text-accent transition-colors">Shop</Link>
            <Link to="/shop?category=collections" onClick={closeMobileMenu} className="hover:text-accent transition-colors">Collections</Link>
            <Link to="/about" onClick={closeMobileMenu} className="hover:text-accent transition-colors">About Us</Link>
            <Link to="/journal" onClick={closeMobileMenu} className="hover:text-accent transition-colors">Journal</Link>
          </nav>

          <div className="flex flex-col gap-6 text-xs uppercase tracking-widest mt-12">
            <Link to="/wishlist" onClick={closeMobileMenu} className="active:text-accent transition-colors">Wishlist</Link>
            <Link to="/account" onClick={closeMobileMenu} className="text-left active:text-accent transition-colors">Account</Link>
            <button onClick={() => { closeMobileMenu(); useUIStore.getState().toggleSearch(); }} className="text-left active:text-accent transition-colors">Search</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

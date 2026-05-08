import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { triggerHaptic } from '../../utils/haptics';
import logo from '../../assets/logo.png';

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  const handleClose = () => {
    triggerHaptic('light');
    closeMobileMenu();
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[200] liquid-glass flex flex-col pt-24 px-10 pb-12 rounded-t-[3rem]"
        >
          <button 
            onClick={handleClose} 
            className="absolute top-8 right-8 p-3 bg-white/5 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="mb-20">
            <img src={logo} alt="Wearition" className="h-20 w-auto object-contain brightness-125" />
          </div>
          
          <nav className="flex flex-col gap-10 text-4xl font-serif mb-auto">
            <Link to="/" onClick={handleClose} className="hover:text-accent transition-colors flex items-center justify-between group">
              <span>Home</span>
              <span className="text-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">→</span>
            </Link>
            <Link to="/shop" onClick={handleClose} className="hover:text-accent transition-colors flex items-center justify-between group">
              <span>Collections</span>
              <span className="text-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">→</span>
            </Link>
            <Link to="/about" onClick={handleClose} className="hover:text-accent transition-colors flex items-center justify-between group">
              <span>Heritage</span>
              <span className="text-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">→</span>
            </Link>
            <Link to="/contact" onClick={handleClose} className="hover:text-accent transition-colors flex items-center justify-between group">
              <span>Concierge</span>
              <span className="text-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">→</span>
            </Link>
          </nav>

          <div className="flex flex-col gap-8 text-[10px] uppercase tracking-[0.3em] mt-12 pt-12 border-t border-white/10">
            <div className="flex justify-between items-center">
              <Link to="/wishlist" onClick={handleClose} className="active:text-accent">Wishlist</Link>
              <Link to="/account" onClick={handleClose} className="active:text-accent">Account</Link>
            </div>
            <p className="text-center text-white/20">Maison Wearition &copy; 2026</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

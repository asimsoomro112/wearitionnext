import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { triggerHaptic } from '../../utils/haptics';
import { motion } from 'framer-motion';

export function MobileBottomBar() {
  const location = useLocation();
  const { openCart, closeCart, closeSearch, toggleSearch } = useUIStore();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  const handleAction = (callback?: () => void, isSearchToggle = false) => {
    triggerHaptic('light');
    if (!isSearchToggle) closeSearch(); 
    closeCart();   
    if (callback) callback();
  };

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[400px]">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="liquid-glass rounded-[2rem] px-4 py-2 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/10"
      >
        <Link 
          to="/" 
          onClick={() => handleAction()}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all ${isActive('/') ? 'text-accent bg-white/5' : 'text-foreground/40'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[8px] mt-1 uppercase tracking-[0.2em] font-bold">Home</span>
        </Link>
        
        <button 
          onClick={() => handleAction(() => toggleSearch(), true)} 
          className="flex flex-col items-center justify-center py-2 px-3 text-foreground/40 active:text-accent"
        >
          <Search className="w-5 h-5" />
          <span className="text-[8px] mt-1 uppercase tracking-[0.2em] font-bold">Search</span>
        </button>

        <Link 
          to="/wishlist" 
          onClick={() => handleAction()}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all ${isActive('/wishlist') ? 'text-accent bg-white/5' : 'text-foreground/40'}`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[8px] mt-1 uppercase tracking-[0.2em] font-bold">Saved</span>
        </Link>

        <button 
          onClick={() => handleAction(openCart)} 
          className="flex flex-col items-center justify-center py-2 px-3 text-foreground/40 active:text-accent relative"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[8px] mt-1 uppercase tracking-[0.2em] font-bold">Bag</span>
          {cartCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-2 bg-accent text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-lg"
            >
              {cartCount}
            </motion.span>
          )}
        </button>

        <Link 
          to="/account" 
          onClick={() => handleAction()}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all ${isActive('/account') ? 'text-accent bg-white/5' : 'text-foreground/40'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[8px] mt-1 uppercase tracking-[0.2em] font-bold">Me</span>
        </Link>
      </motion.div>
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';

export function MobileBottomBar() {
  const location = useLocation();
  const { openCart, openMobileMenu } = useUIStore();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-secondary border-t border-border-color pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/') ? 'text-accent' : 'text-foreground/60 active:text-foreground'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[9px] mt-1 uppercase tracking-wider font-medium">Home</span>
        </Link>
        <button onClick={() => useUIStore.getState().toggleSearch()} className={`flex flex-col items-center justify-center w-full h-full text-foreground/60 active:text-foreground`}>
          <Search className="w-5 h-5" />
          <span className="text-[9px] mt-1 uppercase tracking-wider font-medium">Search</span>
        </button>
        <Link to="/wishlist" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/wishlist') ? 'text-accent' : 'text-foreground/60 active:text-foreground'}`}>
          <Heart className="w-5 h-5" />
          <span className="text-[9px] mt-1 uppercase tracking-wider font-medium">Saved</span>
        </Link>
        <button onClick={openCart} className="flex flex-col items-center justify-center w-full h-full text-foreground/60 active:text-foreground relative">
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[9px] mt-1 uppercase tracking-wider font-medium">Bag</span>
          {cartCount > 0 && (
            <span className="absolute top-2 right-4 bg-foreground text-background text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
              {cartCount}
            </span>
          )}
        </button>
        <Link to="/account" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/account') ? 'text-accent' : 'text-foreground/60 active:text-foreground'}`}>
          <User className="w-5 h-5" />
          <span className="text-[9px] mt-1 uppercase tracking-wider font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../../store/wishlistStore';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/currency';

interface ProductCardProps {
  product: any;
  index?: number;
  key?: React.Key;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const isWished = wishlistIds.includes(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!isWished) {
      toast.success(`${product.title} added to your wishlist`);
    } else {
      toast(`${product.title} removed from your wishlist`);
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-white/5 cursor-pointer">
          <img 
            src={product.images?.[0] || ''} 
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          />
          <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
            <button className="bg-foreground text-background px-8 py-3 text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform duration-300 pointer-events-auto">
              Quick Add
            </button>
          </div>
        </div>

        <button 
          onClick={handleWishlistToggle}
          className={`absolute top-4 right-4 z-10 p-2 transition-all duration-300 md:hover:scale-110 ${isWished ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
        >
          <Heart className={`w-5 h-5 ${isWished ? 'fill-foreground text-foreground' : 'text-foreground'}`} strokeWidth={1.5} />
        </button>

        <div className="flex flex-col items-center mt-6">
          <h3 className="font-sans font-medium text-sm tracking-wide mb-2 text-foreground">{product.title}</h3>
          <p className="text-foreground/60 text-sm font-sans">{formatCurrency(product.price)}</p>
        </div>
      </Link>
    </motion.div>
  );
}

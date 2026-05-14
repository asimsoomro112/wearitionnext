"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye } from 'lucide-react';
import Link from 'next/link';
import { useWishlistStore } from '../../store/wishlistStore';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import { getOptimizedImage } from '../../lib/images';

import { PerspectiveContainer } from '../layout/PerspectiveContainer';

interface ProductCardProps {
  product: any;
  index?: number;
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

  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  return (
    <motion.div 
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group"
      style={{ perspective: "1000px" }}
    >
      <Link href={`/product/${product.id}`} className="block relative" data-cursor="VIEW">
        <PerspectiveContainer strength={10} className="mb-4">
          <div className="relative aspect-[3/4] overflow-hidden bg-foreground/5 cursor-pointer rounded-sm">
            <img 
              src={getOptimizedImage(product.images?.[0])} 
              alt={product.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06] ${product.images?.length > 1 ? 'group-hover:opacity-0' : ''} ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
            />
            {product.images && product.images.length > 1 && (
              <img 
                src={getOptimizedImage(product.images[1])} 
                alt={`${product.title} alternate`}
                loading="lazy"
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] opacity-0 group-hover:opacity-100 group-hover:scale-[1.06] ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
              />
            )}
            
            {/* Hover overlay with subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8 pointer-events-none">
              <motion.span 
                initial={{ y: 10, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                className="bg-white/90 text-black px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] font-bold pointer-events-auto backdrop-blur-sm rounded-sm"
              >
                <Eye className="w-3 h-3 inline mr-2 -mt-0.5" />
                Quick View
              </motion.span>
            </div>
          </div>
          {/* Badges moved inside PerspectiveContainer */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20 pointer-events-none">
            {product.isOnSale && product.salePrice && (
              <span className="bg-red-500 text-white text-[9px] uppercase tracking-widest px-3 py-1.5 font-bold pointer-events-auto">Sale</span>
            )}
            {isLowStock && (
              <span className="bg-accent text-black text-[9px] uppercase tracking-widest px-3 py-1.5 font-bold animate-pulse pointer-events-auto">Only {product.stock} Left</span>
            )}
            {isOutOfStock && (
              <span className="bg-foreground/80 text-background text-[9px] uppercase tracking-widest px-3 py-1.5 font-bold pointer-events-auto">Sold Out</span>
            )}
            {product.isNew && (
              <span className="bg-emerald-500 text-white text-[9px] uppercase tracking-widest px-3 py-1.5 font-bold pointer-events-auto">New</span>
            )}
          </div>
        </PerspectiveContainer>

        {/* Wishlist button */}
        <button 
          onClick={handleWishlistToggle}
          className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 md:hover:scale-110 backdrop-blur-sm ${
            isWished 
              ? 'bg-accent/20 border border-accent/30' 
              : 'bg-black/20 border border-white/20 opacity-100 md:opacity-0 md:group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-accent text-accent' : 'text-white'}`} strokeWidth={1.5} />
        </button>

        {/* Product Info */}
        <div className="flex flex-col items-start mt-4 px-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-1">{product.category || 'Collection'}</p>
          <h3 className="font-sans font-medium text-sm tracking-wide mb-1.5 text-foreground group-hover:text-accent transition-colors duration-300">{product.title}</h3>
          <div className="flex items-center gap-3 mb-3">
            {product.isOnSale && product.salePrice ? (
              <>
                <p className="text-accent text-sm font-semibold">{formatCurrency(product.salePrice)}</p>
                <p className="text-foreground/40 text-xs line-through">{formatCurrency(product.price)}</p>
              </>
            ) : (
              <p className="text-foreground/60 text-sm font-sans">{formatCurrency(product.price)}</p>
            )}
          </div>

          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              {product.colors.map((color: string) => (
                <div 
                  key={color}
                  className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-[9px] text-white/30 ml-1">+{product.colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// Helper to convert common color names to hex codes
const getColorHex = (colorName: string) => {
  const colors: Record<string, string> = {
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#00ff00',
    'navy': '#000080',
    'gold': '#D4AF37',
    'maroon': '#800000',
    'grey': '#808080',
    'silver': '#C0C0C0',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'emerald': '#50C878',
    'brown': '#8B4513',
    'cream': '#FFFDD0',
    'beige': '#F5F5DC',
    'khaki': '#F0E68C',
    'peach': '#FFDAB9',
    'teal': '#008080',
    'lavender': '#E6E6FA',
    'orange': '#FFA500',
    'yellow': '#FFFF00',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'olive': '#808000',
    'lime': '#00FF00',
    'mustard': '#FFDB58',
    'charcoal': '#36454F',
    'burgundy': '#800020',
    'indigo': '#4B0082',
    'crimson': '#DC143C',
    'turquoise': '#40E0D0',
    'tan': '#D2B48C',
    'rust': '#B7410E',
    'olive green': '#556B2F',
    'rose gold': '#B76E79',
    'noir': '#000000',
    'luxury red': '#b91c1c',
    'emerald green': '#065f46'
  };
  return colors[colorName.toLowerCase()] || '#888888';
};

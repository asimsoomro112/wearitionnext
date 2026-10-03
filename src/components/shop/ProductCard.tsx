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
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col bg-[#0a0a0a]/70 border border-white/5 hover:border-accent/40 transition-all duration-500 rounded-sm p-3 overflow-hidden"
    >
      {/* Wishlist button — outside the card link for valid HTML/a11y */}
      <button 
        onClick={handleWishlistToggle}
        aria-label="Save to Wishlist"
        className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 md:hover:scale-110 backdrop-blur-md ${
          isWished 
            ? 'bg-accent text-white shadow-lg' 
            : 'bg-black/40 border border-white/15 text-white/80 hover:text-white hover:border-white/30'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-white text-white' : 'text-white'}`} strokeWidth={1.5} />
      </button>

      <Link href={`/product/${product.id}`} className="block relative flex-grow" data-cursor="VIEW">
        <PerspectiveContainer strength={8} className="mb-4">
          <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900 cursor-pointer rounded-sm">
            <img 
              src={getOptimizedImage(product.images?.[0])} 
              alt={product.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.05] ${product.images?.length > 1 ? 'group-hover:opacity-0' : ''} ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
            />
            {product.images && product.images.length > 1 && (
              <img 
                src={getOptimizedImage(product.images[1])} 
                alt={`${product.title} alternate`}
                loading="lazy"
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] opacity-0 group-hover:opacity-100 group-hover:scale-[1.05] ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
              />
            )}
            
            {/* Dark gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-6 pointer-events-none">
              <span className="bg-accent text-white px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] font-semibold pointer-events-auto rounded-full shadow-2xl flex items-center gap-1.5 transition-transform duration-300 hover:scale-105">
                <Eye className="w-3.5 h-3.5" />
                Quick View
              </span>
            </div>
          </div>

          {/* Luxury status badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
            {product.isOnSale && product.salePrice && (
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] uppercase tracking-[0.2em] px-2.5 py-1 font-semibold rounded-full pointer-events-auto">Sale</span>
            )}
            {isLowStock && (
              <span className="bg-white/15 backdrop-blur-md border border-white/30 text-white text-[8px] uppercase tracking-[0.2em] px-2.5 py-1 font-semibold rounded-full animate-pulse pointer-events-auto">Only {product.stock} Left</span>
            )}
            {isOutOfStock && (
              <span className="bg-black/80 backdrop-blur-md border border-white/10 text-white/50 text-[8px] uppercase tracking-[0.2em] px-2.5 py-1 font-semibold rounded-full pointer-events-auto">Sold Out</span>
            )}
            {product.isNew && (
              <span className="bg-accent text-white text-[8px] uppercase tracking-[0.2em] px-2.5 py-1 font-bold rounded-full pointer-events-auto">New</span>
            )}
          </div>
        </PerspectiveContainer>

        {/* Product Info */}
        <div className="flex flex-col items-start px-1 pt-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-1">{product.category || 'Atelier Collection'}</p>
          <h3 className="font-sans font-medium text-sm tracking-wide text-white group-hover:text-white/80 transition-colors duration-300 line-clamp-1 mb-1.5">{product.title}</h3>
          <div className="flex items-center gap-2.5 mb-2">
            {product.isOnSale && product.salePrice ? (
              <>
                <p className="text-white text-sm font-semibold">{formatCurrency(product.salePrice)}</p>
                <p className="text-white/40 text-xs line-through">{formatCurrency(product.price)}</p>
              </>
            ) : (
              <p className="text-white/90 text-sm font-sans">{formatCurrency(product.price)}</p>
            )}
          </div>

          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-auto pt-1">
              {product.colors.slice(0, 5).map((color: string) => (
                <div 
                  key={color}
                  className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm"
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

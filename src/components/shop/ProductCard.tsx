"use client";
import React from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useWishlistStore } from '../../store/wishlistStore';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import { getOptimizedImage } from '../../lib/images';

interface ProductCardProps {
  product: any;
  index?: number;
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop';

export function ProductCard({ product }: ProductCardProps) {
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const isWished = wishlistIds.includes(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!isWished) {
      toast.success(`${product.title || 'Product'} added to your wishlist`);
    } else {
      toast(`${product.title || 'Product'} removed from your wishlist`);
    }
  };

  const isOutOfStock = product.stock !== undefined && product.stock === 0;
  const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const title = product.title || product.name || 'Wearition product';

  return (
    <div className="group">
      <Link href={`/product/${product.id}`} className="block relative">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <img
            src={getOptimizedImage(product.images?.[0]) || FALLBACK_IMG}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMG;
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] ${
              isOutOfStock ? 'grayscale opacity-60' : ''
            }`}
          />

          {/* top-left: brand eyebrow */}
          {product.brand && (
            <span className="absolute top-4 left-4 z-10 text-[10px] uppercase tracking-[0.22em] text-white/85 bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-full">
              {product.brand}
            </span>
          )}

          {/* top-right: wishlist */}
          <button
            onClick={handleWishlistToggle}
            aria-label="Toggle wishlist"
            className="absolute top-3 right-3 z-10 w-11 h-11 rounded-full glass flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <Heart className={`w-4 h-4 ${isWished ? 'fill-[#339e9b] text-[#339e9b]' : ''}`} />
          </button>

          {/* sale badge */}
          {product.isOnSale && product.salePrice && (
            <span className={`absolute left-4 z-10 text-[9px] uppercase tracking-[0.2em] font-bold bg-[#339e9b] text-white px-3 py-1.5 rounded-full ${product.brand ? 'top-[68px]' : 'top-4'}`}>
              Sale
            </span>
          )}

          {/* hover overlay — the reference's signature: full-card dark veil with
              large view text fading up, image pushing in slightly */}
          <div className="absolute inset-0 z-10 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
            <span className="font-display font-extrabold uppercase tracking-[0.2em] text-white text-2xl translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-center gap-2">
              View <ArrowUpRight className="w-6 h-6" />
            </span>
          </div>

          {/* bottom glass bar: name + price */}
          <div className="absolute bottom-3 left-3 right-3 z-10 glass rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-white text-sm font-medium leading-snug line-clamp-2">{title}</h3>
              <p className="text-white/55 text-[11px] uppercase tracking-[0.16em] mt-0.5">
                {product.category || 'Wearition'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white text-sm font-semibold">{formatCurrency(price)}</p>
              {product.isOnSale && product.salePrice && (
                <p className="text-white/40 text-xs line-through">{formatCurrency(product.price)}</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

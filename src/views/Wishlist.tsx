"use client";
import { useEffect, useState } from 'react';
import { useWishlistStore } from '../store/wishlistStore';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ProductCard } from '../components/shop/ProductCard';
import Link from 'next/link';

export function Wishlist() {
  const { wishlistIds } = useWishlistStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const fetchedProducts = [];
        for (const id of wishlistIds) {
          const docSnap = await getDoc(doc(db, "products", id));
          if (docSnap.exists()) {
            fetchedProducts.push({ id: docSnap.id, ...docSnap.data() });
          }
        }
        setProducts(fetchedProducts);
      } catch (e) {
        console.error("Failed to fetch wishlist products", e);
      } finally {
         setLoading(false);
      }
    }
    fetchWishlistProducts();
  }, [wishlistIds]);

  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <header className="mb-20 text-center">
          <h1 className="font-serif text-[4rem] leading-none tracking-tight text-foreground mb-6">Your Wishlist</h1>
          <p className="text-foreground/60 text-sm max-w-xl mx-auto font-sans">
            {wishlistIds.length} items saved
          </p>
        </header>

        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-t border-foreground rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
           <div className="text-center text-foreground/40 pt-12">
              <p className="uppercase text-xs tracking-widest mb-8">Your wishlist is empty</p>
              <Link href="/shop" className="inline-block bg-foreground text-background px-10 py-5 uppercase text-xs tracking-[0.2em] font-medium hover:bg-accent transition-colors">
                 Continue Shopping
              </Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

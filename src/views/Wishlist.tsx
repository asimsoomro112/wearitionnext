"use client";
import { useEffect, useState } from 'react';
import { useWishlistStore } from '../store/wishlistStore';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ProductCard } from '../components/shop/ProductCard';
import Link from 'next/link';
import { Bookmark, ArrowRight } from 'lucide-react';

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
    <div className="w-full pt-32 md:pt-40 px-6 md:px-12 pb-32 bg-[#050505] text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-14 pb-8 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-white/40 mb-2">
              [01] • CURATED WISHLIST
            </p>
            <h1 className="font-serif text-3xl md:text-5xl tracking-tight text-white">
              Saved Archives
            </h1>
          </div>
          <p className="text-white/40 text-xs font-mono tracking-[0.2em] uppercase">
            [{wishlistIds.length} Selections Saved]
          </p>
        </header>

        {loading ? (
          <div className="w-full py-32 flex flex-col items-center justify-center gap-4">
            <div className="w-7 h-7 border border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/40">
              Loading Saved Pieces...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-28 bg-[#0a0a0a] border border-white/5 rounded-sm p-8 max-w-xl mx-auto">
            <Bookmark className="w-12 h-12 text-white/20 mx-auto mb-4 stroke-1" />
            <h3 className="font-serif text-2xl text-white mb-2">No Saved Pieces</h3>
            <p className="text-white/40 text-xs font-sans max-w-sm mx-auto mb-8 leading-relaxed">
              Explore the atelier collections and bookmark your desired couture garments for future acquisition.
            </p>
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-[10px] uppercase font-mono tracking-[0.2em] font-semibold hover:bg-white/90 transition-all shadow-xl"
            >
              <span>Explore Atelier Archive ↗</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

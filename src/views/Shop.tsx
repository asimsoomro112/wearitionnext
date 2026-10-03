"use client";
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ProductCard } from '../components/shop/ProductCard';
import { SEO } from '../components/layout/SEO';

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
];

function ProductSkeleton() {
  return (
    <div className="bg-[#0d0d0d] border border-white/5 p-3 rounded-sm animate-pulse">
      <div className="aspect-[3/4] bg-white/[0.04] mb-4 rounded-sm" />
      <div className="h-2.5 bg-white/[0.05] rounded mb-2.5 w-1/3" />
      <div className="h-3.5 bg-white/[0.07] rounded mb-2 w-3/4" />
      <div className="h-3 bg-white/[0.05] rounded w-1/4" />
    </div>
  );
}

export function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{name: string, value: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recommended');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.get('search')?.toLowerCase() || '';
  const categoryFilter = searchParams.get('category')?.toLowerCase() || '';
  const brandFilter = searchParams.get('brand')?.toLowerCase() || '';

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'settings', 'store');
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().collections) {
          const fetchedCats = snap.data().collections.map((c: string) => ({
            name: c,
            value: c.toLowerCase()
          }));
          setCategories([{ name: 'All Pieces', value: '' }, ...fetchedCats]);
        } else {
          const defaults = ['Couture', 'Ready-to-Wear', 'Silks & Chiffon', 'Embroidery', 'Bridal', 'Accessories'].map(c => ({
            name: c, value: c.toLowerCase()
          }));
          setCategories([{ name: 'All Pieces', value: '' }, ...defaults]);
        }
      } catch (e) {
        console.error("Error fetching shop settings:", e);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          where("isPublished", "==", true),
        );
        const querySnapshot = await getDocs(q);
        let fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

        if (searchString) {
          fetched = fetched.filter(p =>
            p.title?.toLowerCase().includes(searchString) ||
            (p.description && p.description.toLowerCase().includes(searchString))
          );
        }

        if (categoryFilter) {
          fetched = fetched.filter(p => p.category?.toLowerCase() === categoryFilter);
        }

        if (brandFilter) {
          fetched = fetched.filter(p => p.brand?.toLowerCase() === brandFilter);
        }

        setProducts(fetched);
      } catch (e) {
        console.error("Error fetching products", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchString, categoryFilter, brandFilter]);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    if (sortBy === 'price_asc') sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') sorted.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return sorted;
  }, [products, sortBy]);

  const setCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('category', value);
    else params.delete('category');
    params.delete('brand');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="w-full pt-36 md:pt-44 px-6 md:px-12 lg:px-16 pb-36 bg-[#030303] text-[#fafafa] min-h-screen">
      <SEO 
        title={brandFilter ? `${brandFilter.toUpperCase()} Collection • WEARITION` : categoryFilter ? `${categoryFilter.toUpperCase()} • WEARITION` : 'Atelier Archive • WEARITION'}
        description="Explore WEARITION's curated collection of luxury haute couture and ready-to-wear pieces designed for the modern visionary."
      />
      <div className="max-w-[1440px] mx-auto">
        {/* Editorial Section Header */}
        <header className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[9px] uppercase tracking-[0.25em] text-[#adadad] font-mono mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#339e9b]" />
            <span>ATELIER ARCHIVE &bull; CATALOGUE</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-none tracking-tight text-white uppercase mb-4"
          >
            {brandFilter ? brandFilter.toUpperCase() : categoryFilter ? categoryFilter.toUpperCase() : 'THE ARCHIVE'}
          </motion.h1>
          <p className="text-[#adadad] text-xs md:text-sm max-w-xl mx-auto font-sans tracking-wide">
            {loading ? 'Curating your atelier selection...' : `${products.length} bespoke piece${products.length !== 1 ? 's' : ''} available for immediate acquisition.`}
          </p>
        </header>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setCategory(cat.value)}
              className={`px-5 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase font-mono font-medium transition-all duration-300 cursor-pointer ${
                categoryFilter === cat.value
                  ? 'bg-accent text-white shadow-xl scale-105 border border-accent font-semibold'
                  : 'bg-white/[0.03] border border-white/10 text-[#adadad] hover:border-white/30 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Metric Bar */}
        <div className="flex justify-between items-center border-y border-white/10 py-4 mb-12 text-[10px] uppercase font-mono tracking-[0.22em] text-[#adadad]">
          <span className="flex items-center gap-2">
            <span className="inline-block w-1 h-1 rounded-full bg-[#339e9b]" />
            {loading ? 'CALCULATING...' : searchString ? (
              <>{sortedProducts.length} RESULT{sortedProducts.length === 1 ? '' : 'S'} FOR &ldquo;{searchString.toUpperCase()}&rdquo;</>
            ) : `${sortedProducts.length} ARCHIVE PIECES`}
            {searchString && !loading && (
              <button
                onClick={clearSearch}
                className="ml-1 px-2.5 py-1 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/40 transition-colors text-[9px] tracking-[0.2em]"
                aria-label="Clear search"
              >
                ✕ CLEAR
              </button>
            )}
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-white/30">SORT BY:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-[#0d0d0d] border border-white/10 rounded-full px-3 py-1.5 outline-none text-white/80 cursor-pointer uppercase text-[10px] tracking-[0.18em] hover:border-white/30 transition-colors font-mono"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#0d0d0d] text-white">{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-28 px-4 border border-white/5 bg-[#0d0d0d] rounded-sm"
          >
            <p className="font-display text-5xl text-white/10 mb-6">◇</p>
            <h3 className="font-display text-2xl md:text-3xl text-white/80 uppercase tracking-wide mb-3">Curating New Silhouettes</h3>
            <p className="text-[#adadad] text-xs md:text-sm max-w-md mx-auto font-sans mb-8">
              No pieces currently match this specific atelier filter. Our master tailors are releasing new drops weekly.
            </p>
            <button 
              onClick={() => {
                const params = new URLSearchParams();
                router.push(`${pathname}`);
              }} 
              className="px-6 py-3 rounded-full bg-accent text-white text-[10px] uppercase font-mono tracking-[0.2em] font-bold hover:bg-[#3ab0ad] transition-colors shadow-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {sortedProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

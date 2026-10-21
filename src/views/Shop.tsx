"use client";
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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

// Price filter buckets (catalog range is roughly Rs. 2,599–6,299).
const PRICE_BUCKETS = [
  { label: 'All Prices', value: '' },
  { label: 'Under Rs. 3,000', value: 'under3000', test: (p: number) => p < 3000 },
  { label: 'Rs. 3,000 – 4,000', value: '3000-4000', test: (p: number) => p >= 3000 && p < 4000 },
  { label: 'Rs. 4,000 – 5,000', value: '4000-5000', test: (p: number) => p >= 4000 && p < 5000 },
  { label: 'Above Rs. 5,000', value: 'over5000', test: (p: number) => p >= 5000 },
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
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recommended');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.get('search')?.toLowerCase() || '';
  const categoryFilter = searchParams.get('category')?.toLowerCase() || '';
  const brandFilter = searchParams.get('brand')?.toLowerCase() || '';
  const priceFilter = searchParams.get('price') || '';

  // Products are fetched ONCE; every filter (search, category, brand,
  // price) applies instantly on the client — no refetch, no skeleton
  // flash on each filter click.
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

        // Dedupe: Firestore contains duplicate product documents (same title
        // entered multiple times, e.g. "BEECHTREE LATEST COLLECTION 2026" x7).
        // Keep the first occurrence per normalized title so the grid does not
        // show the same product repeatedly. Permanent fix = delete the dupes
        // in the admin panel; this keeps the storefront clean meanwhile.
        const seen = new Set<string>();
        fetched = fetched.filter(p => {
          const key = (p.title || '').trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setProducts(fetched);
      } catch (e) {
        console.error("Error fetching products", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filter options are derived from the actual catalog, so they can never
  // drift from what is really in the store (previously categories came
  // from a settings document that could be empty or stale).
  const brandOptions = useMemo(() => {
    const map = new Map<string, { name: string; value: string; count: number }>();
    products.forEach(p => {
      const b = (p.brand || '').trim();
      if (!b) return;
      const key = b.toLowerCase();
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { name: b, value: key, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const categoryOptions = useMemo(() => {
    const map = new Map<string, { name: string; value: string }>();
    products.forEach(p => {
      const c = (p.category || '').trim();
      if (!c) return;
      const key = c.toLowerCase();
      if (!map.has(key)) map.set(key, { name: c, value: key });
    });
    return [{ name: 'All', value: '' }, ...Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let out = products;
    if (searchString) {
      out = out.filter(p =>
        p.title?.toLowerCase().includes(searchString) ||
        (p.description && p.description.toLowerCase().includes(searchString))
      );
    }
    if (categoryFilter) {
      out = out.filter(p => p.category?.toLowerCase() === categoryFilter);
    }
    if (brandFilter) {
      out = out.filter(p => p.brand?.toLowerCase() === brandFilter);
    }
    if (priceFilter) {
      const bucket = PRICE_BUCKETS.find(b => b.value === priceFilter);
      if (bucket?.test) {
        out = out.filter(p => typeof p.price === 'number' && bucket.test!(p.price));
      }
    }
    return out;
  }, [products, searchString, categoryFilter, brandFilter, priceFilter]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortBy === 'price_asc') sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') sorted.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return sorted;
  }, [filteredProducts, sortBy]);

  const hasActiveFilters = Boolean(searchString || categoryFilter || brandFilter || priceFilter);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const setCategory = (value: string) => updateParam('category', value);
  const setBrand = (value: string) => updateParam('brand', value);
  const setPrice = (value: string) => updateParam('price', value);

  const clearSearch = () => updateParam('search', '');

  const clearAllFilters = () => router.push(pathname);

  return (
    <div className="w-full pt-36 md:pt-44 px-6 md:px-12 lg:px-16 pb-36 bg-[#030303] text-[#fafafa] min-h-screen">
      <SEO 
        title={brandFilter ? `${brandFilter.toUpperCase()} Collection • WEARITION` : categoryFilter ? `${categoryFilter.toUpperCase()} • WEARITION` : 'Shop All Products • WEARITION'}
        description="Browse the full WEARITION collection — the latest branded suits from Pakistan's top fashion houses, with cash on delivery nationwide."
      />
      <div className="max-w-[1440px] mx-auto">
        {/* Editorial Section Header */}
        <header className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[9px] uppercase tracking-[0.25em] text-[#adadad] font-mono mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#339e9b]" />
            <span>SHOP &bull; FULL CATALOGUE</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-none tracking-tight text-white uppercase mb-4"
          >
            {brandFilter ? brandFilter.toUpperCase() : categoryFilter ? categoryFilter.toUpperCase() : 'SHOP ALL'}
          </motion.h1>
          <p className="text-[#adadad] text-xs md:text-sm max-w-xl mx-auto font-sans tracking-wide">
            {loading ? 'Loading products...' : `${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''} from the latest collections.`}
          </p>
        </header>

        {/* Category Filter Pills — derived from the catalog itself; the row
            hides when the catalog has fewer than two real categories. */}
        {!loading && categoryOptions.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
            {categoryOptions.map((cat) => (
              <button
                key={cat.value || 'all'}
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
        )}

        {/* Brand & Price Filters */}
        {!loading && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 mb-14">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase font-mono tracking-[0.22em] text-white/30">Brand:</span>
              <select
                value={brandFilter}
                onChange={e => setBrand(e.target.value)}
                className="bg-[#0d0d0d] border border-white/10 rounded-full px-3 py-2 outline-none text-white/80 cursor-pointer uppercase text-[10px] tracking-[0.18em] hover:border-white/30 transition-colors font-mono max-w-[240px]"
                aria-label="Filter by brand"
              >
                <option value="" className="bg-[#0d0d0d] text-white">All Brands</option>
                {brandOptions.map(b => (
                  <option key={b.value} value={b.value} className="bg-[#0d0d0d] text-white">
                    {b.name} ({b.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {PRICE_BUCKETS.map(bucket => (
                <button
                  key={bucket.value || 'all-prices'}
                  onClick={() => setPrice(bucket.value)}
                  className={`px-4 py-2 rounded-full text-[10px] tracking-[0.16em] uppercase font-mono font-medium transition-all duration-300 cursor-pointer ${
                    priceFilter === bucket.value
                      ? 'bg-accent text-white border border-accent font-semibold'
                      : 'bg-white/[0.03] border border-white/10 text-[#adadad] hover:border-white/30 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {bucket.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/50 underline underline-offset-4 hover:text-white transition-colors cursor-pointer"
              >
                Clear all filters ✕
              </button>
            )}
          </div>
        )}

        {/* Sort & Metric Bar */}
        <div className="flex justify-between items-center border-y border-white/10 py-4 mb-12 text-[10px] uppercase font-mono tracking-[0.22em] text-[#adadad]">
          <span className="flex items-center gap-2">
            <span className="inline-block w-1 h-1 rounded-full bg-[#339e9b]" />
            {loading ? 'LOADING...' : searchString ? (
              <>{sortedProducts.length} RESULT{sortedProducts.length === 1 ? '' : 'S'} FOR &ldquo;{searchString.toUpperCase()}&rdquo;</>
            ) : `${sortedProducts.length} PRODUCTS`}
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
        ) : sortedProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-28 px-4 border border-white/5 bg-[#0d0d0d] rounded-sm"
          >
            <p className="font-display text-5xl text-white/10 mb-6">◇</p>
            <h3 className="font-display text-2xl md:text-3xl text-white/80 uppercase tracking-wide mb-3">Nothing Found</h3>
            <p className="text-[#adadad] text-xs md:text-sm max-w-md mx-auto font-sans mb-8">
              No products match this filter right now. New suits are added regularly — try a different search or browse the full collection.
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

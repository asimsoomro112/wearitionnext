import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/shop/ProductCard';

const CATEGORIES = [
  { name: 'All', value: '' },
  { name: 'Women', value: 'women' },
  { name: 'Men', value: 'men' },
  { name: 'Shirts', value: 'shirts' },
  { name: 'Pants', value: 'pants' },
  { name: 'Tech-Noir', value: 'tech-noir' },
  { name: 'Accessories', value: 'accessories' },
  { name: 'Shoes', value: 'shoes' },
];

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
];

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-foreground/5 mb-4 rounded-sm" />
      <div className="h-3 bg-foreground/5 rounded mb-2 w-3/4" />
      <div className="h-3 bg-foreground/5 rounded w-1/2" />
    </div>
  );
}

export function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recommended');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchString = searchParams.get('search')?.toLowerCase() || '';
  const categoryFilter = searchParams.get('category')?.toLowerCase() || '';

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

        // Sorting
        if (sortBy === 'price_asc') fetched.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price_desc') fetched.sort((a, b) => b.price - a.price);
        else if (sortBy === 'newest') fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setProducts(fetched);
      } catch (e) {
        console.error("Error fetching products", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchString, categoryFilter, sortBy]);

  const setCategory = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set('category', value);
    else params.delete('category');
    setSearchParams(params);
  };

  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background">
      <div className="max-w-[1440px] mx-auto">
        <header className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-4xl sm:text-5xl md:text-[4rem] leading-tight tracking-tight text-foreground mb-4"
          >
            {categoryFilter ? categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1) : 'The Collection'}
          </motion.h1>
          <p className="text-foreground/50 text-sm max-w-xl mx-auto font-sans">
            {loading ? 'Curating your collection...' : `${products.length} piece${products.length !== 1 ? 's' : ''} available`}
          </p>
        </header>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setCategory(cat.value)}
              className={`px-5 py-2.5 rounded-full border text-xs tracking-widest uppercase font-medium transition-all duration-300 ${
                categoryFilter === cat.value
                  ? 'bg-foreground text-background border-foreground scale-105'
                  : 'bg-transparent border-foreground/20 text-foreground/60 hover:border-foreground/50 hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Bar */}
        <div className="flex justify-between items-center border-y border-foreground/10 py-5 mb-14 text-xs uppercase tracking-widest text-foreground/60">
          <span>{loading ? '...' : `${products.length} Results`}</span>
          <div className="flex items-center gap-3">
            <span className="hidden md:block">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none text-foreground/80 cursor-pointer uppercase text-xs tracking-widest"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#0a0a0a]">{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <p className="font-serif text-5xl text-foreground/10 mb-6">◇</p>
            <p className="font-serif text-3xl text-foreground/30 mb-4">Coming Soon</p>
            <p className="text-foreground/40 text-sm font-sans mb-10">
              This collection is being carefully curated. Please check back soon.
            </p>
            <button onClick={() => setCategory('')} className="text-xs uppercase tracking-widest border-b border-foreground/30 pb-1 hover:text-accent hover:border-accent transition-colors">
              View All Pieces
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
          >
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo, useRef } from 'react';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '../components/shop/ProductCard';
import { ArrowLeft, ArrowRight, Grid } from 'lucide-react';
import { WearitionSpinner } from '../components/layout/WearitionSpinner';
import { PerspectiveContainer } from '../components/layout/PerspectiveContainer';

export function Brands() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialBrand = searchParams.get('brand');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(initialBrand);
  const [products, setProducts] = useState<any[]>([]);
  const [dynamicBrands, setDynamicBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  // Fetch unique brands from Firestore products
  useEffect(() => {
    async function fetchBrands() {
      try {
        const q = query(collection(db, "products"), where("isPublished", "==", true));
        const snap = await getDocs(q);
        const brands = new Set<string>();
        snap.docs.forEach(doc => {
          const b = doc.data().brand;
          if (b) brands.add(b);
        });
        setDynamicBrands(Array.from(brands).sort());
      } catch (e) {
        console.error("Error fetching brands", e);
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, []);

  useEffect(() => {
    const brandFromUrl = searchParams.get('brand');
    if (brandFromUrl) {
      setSelectedBrand(brandFromUrl);
    } else {
      setSelectedBrand(null);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchBrandProducts() {
      if (!selectedBrand) {
        setProducts([]);
        return;
      }
      setProductsLoading(true);
      try {
        const allQ = query(collection(db, "products"), where("isPublished", "==", true));
        const snap = await getDocs(allQ);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filtered = fetched.filter((p: any) => p.brand?.toLowerCase() === selectedBrand.toLowerCase());
        setProducts(filtered);
      } catch (e) {
        console.error("Error fetching brand products", e);
      } finally {
        setProductsLoading(false);
      }
    }
    fetchBrandProducts();
    
    if (selectedBrand && productsRef.current) {
      setTimeout(() => {
        productsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [selectedBrand]);

  const handleBrandSelect = (brandName: string) => {
    setSelectedBrand(brandName);
    const params = new URLSearchParams(searchParams.toString());
    params.set('brand', brandName.toLowerCase());
    router.push(`/brands?${params.toString()}`, { scroll: false });
  };

  const handleBack = () => {
    setSelectedBrand(null);
    router.push('/brands', { scroll: false });
  };

  if (loading) return <WearitionSpinner />;

  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-screen">
      <SEO 
        title={selectedBrand ? `${selectedBrand.toUpperCase()} Collection` : "Our Brands"} 
        description="Explore the curated collection of premium Pakistani luxury brands we resell." 
      />
      
      <div className="max-w-[1440px] mx-auto">
        <AnimatePresence mode="wait">
          {!selectedBrand ? (
            <motion.div
              key="directory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <header className="mb-20 text-center">
                <span className="text-accent text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">The Houses We Represent</span>
                <TextReveal as="h1" className="font-serif text-5xl sm:text-6xl md:text-8xl text-foreground mb-8">Brands</TextReveal>
                <p className="text-foreground/50 text-sm max-w-xl mx-auto font-sans leading-relaxed">
                  Automatically curated collections from the most prestigious fashion houses in our inventory.
                </p>
              </header>

              {dynamicBrands.length === 0 ? (
                <div className="py-20 text-center opacity-40 uppercase tracking-widest text-xs">No brands found in inventory.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {dynamicBrands.map((brand, i) => (
                    <PerspectiveContainer strength={15} key={brand}>
                      <button 
                        onClick={() => handleBrandSelect(brand)}
                        className="group relative bg-background-secondary/10 border border-white/5 p-10 md:p-14 overflow-hidden rounded-xl transition-all hover:border-accent/30 hover:bg-background-secondary/20 shadow-2xl text-left w-full h-full"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div>
                            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4 uppercase tracking-tighter group-hover:text-accent transition-colors">
                              {brand}
                            </h2>
                            <p className="text-[10px] text-foreground/40 leading-loose uppercase tracking-widest">
                              Official {brand} Resale Collection
                            </p>
                          </div>
                          <div className="mt-12 flex items-center gap-3 text-accent opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">View Collection</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                        <span className="absolute bottom-6 right-8 font-serif text-8xl text-foreground/[0.03] pointer-events-none group-hover:text-accent/[0.05] transition-colors">
                          {i + 1 < 10 ? `0${i + 1}` : i + 1}
                        </span>
                      </button>
                    </PerspectiveContainer>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              ref={productsRef}
            >
              <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
                <div>
                  <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-foreground/40 hover:text-accent transition-colors mb-8 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Brands
                  </button>
                  <span className="text-accent text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Maison Collection</span>
                  <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl text-foreground uppercase tracking-tighter">
                    {selectedBrand}
                  </h1>
                </div>
                <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-foreground/40">
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4" />
                    <span>{products.length} Pieces</span>
                  </div>
                </div>
              </header>

              {productsLoading ? (
                <div className="py-32 flex justify-center">
                  <WearitionSpinner />
                </div>
              ) : products.length === 0 ? (
                <div className="py-32 text-center">
                  <p className="font-serif text-3xl text-foreground/20 mb-4 uppercase tracking-widest">Coming Soon</p>
                  <p className="text-sm text-foreground/40 font-sans max-w-sm mx-auto">
                    The latest collection from {selectedBrand} is currently being curated.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { formatCurrency } from '@/lib/currency';
import { onImgError } from '@/lib/images';
import { MagneticButton } from '../components/layout/MagneticButton';
import { TextReveal } from '../components/layout/TextReveal';
import heroImg from '@/assets/hero-placeholder.jpg';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PerspectiveContainer } from '../components/layout/PerspectiveContainer';

gsap.registerPlugin(ScrollTrigger);

import HeroSection from '../components/HeroSection/HeroSection';

export function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHeroProducts() {
      try {
        const q = query(
          collection(db, "products"),
          where("isPublished", "==", true),
          limit(10)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetched.length > 0) setProducts(fetched);
      } catch (e) {
        console.error("Hero fetch error", e);
      }
    }
    fetchHeroProducts();
  }, []);

  return (
    <div className="bg-background">
      <HeroSection products={products.slice(0, 5)} />

      {/* ─── REST OF THE PAGE ─────────────────────────────────────────────────── */}
      <BrandsMarquee />
      <HorizontalScroller 
        title="Trending Now" 
        products={products} 
        sectionClass="trending-section"
        scrollClass="trending-scroll"
      />
      <FeaturedCollections />
      <StorySection />
      <Footer />
    </div>
  );
}

// ─── BRANDS MARQUEE ──────────────────────────────────────────────────────────
const BrandsMarquee = () => {
  const brands = [
    "Sana Safinaz", "Gul Ahmed", "Khaadi", "Maria.B", "Junaid Jamshed", "Sapphire", 
    "Alkaram Studio", "Nishat Linen", "Zara Shahjahan", "Elan", "Bareeze", "Cross Stitch"
  ];
  
  return (
    <section className="py-24 bg-background overflow-hidden border-y border-border-color/30">
      <div className="container mx-auto px-6 mb-12 text-center">
        <span className="text-accent text-[9px] uppercase tracking-[0.4em] font-bold mb-4 block">Curated Collections</span>
        <h2 className="font-serif text-3xl md:text-5xl text-foreground uppercase tracking-widest">Premium Brands We Resell</h2>
      </div>
      
      <div className="flex flex-col gap-10">
        <motion.div 
          animate={{ x: [0, -2000] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 whitespace-nowrap items-center"
        >
          {[...brands, ...brands].map((brand, i) => (
            <div key={i} className="flex items-center gap-6 group cursor-default">
              <span className="text-4xl md:text-6xl font-serif text-foreground/10 group-hover:text-accent transition-colors duration-500 uppercase tracking-tighter">
                {brand}
              </span>
              <div className="w-2 h-2 rounded-full bg-accent/20" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── HORIZONTAL SCROLLER ──────────────────────────────────────────────────────
const HorizontalScroller = ({ title, products, sectionClass, scrollClass, isSale = false }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !containerRef.current || products.length === 0) return;
    const isDesktop = window.innerWidth > 1024;
    if (isDesktop) {
      const scrollWidth = containerRef.current.scrollWidth;
      const windowWidth = window.innerWidth;
      const paddingRight = 100;
      if (scrollWidth > windowWidth) {
        const ctx = gsap.context(() => {
          gsap.to(containerRef.current, {
            x: -(scrollWidth - windowWidth + paddingRight),
            ease: "none",
            scrollTrigger: {
              trigger: scrollRef.current,
              pin: true,
              scrub: 1,
              start: "center center", 
              end: () => `+=${scrollWidth}`,
              invalidateOnRefresh: true,
            }
          });
        }, scrollRef);
        return () => ctx.revert();
      }
    }
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <section ref={scrollRef} className={`${sectionClass} relative w-full lg:h-screen flex flex-col justify-center overflow-hidden bg-background py-16 lg:py-0`}>
      <div className="w-full max-w-[1440px] mx-auto px-6 relative z-10 mb-8 lg:mb-[8vh]">
        <div className="flex justify-between items-end border-b border-border-color pb-4 mix-blend-difference">
          <TextReveal as="h2" className="font-serif text-3xl md:text-5xl lg:text-7xl uppercase tracking-widest text-foreground">
            {title}
          </TextReveal>
          <Link href="/shop" className="text-xs uppercase tracking-widest hover:text-accent transition-colors text-foreground whitespace-nowrap ml-4">
            View All
          </Link>
        </div>
      </div>
      <div className="relative w-full overflow-x-auto lg:overflow-hidden z-10 pl-6 lg:pl-[max(1.5rem,calc((100vw-1440px)/2))] hide-scrollbar touch-pan-x">
        <div ref={containerRef} className={`flex gap-6 md:gap-10 items-center w-max pb-8 pr-[10vw] ${scrollClass}`}>
          {products.map((product: any, i: number) => (
            <Link href={`/product/${product.id}`} key={i} className="product-card w-[220px] sm:w-[260px] md:w-[350px] group cursor-pointer flex-shrink-0 block">
               <div className="relative aspect-[3/4] overflow-hidden mb-4 md:mb-6 bg-background-secondary/20 shadow-xl parallax-container group/img rounded-lg">
                 <img src={product.images?.[0] || product.image} alt={product.name} onError={onImgError} className="parallax-img absolute top-[-10%] left-0 w-full h-[120%] object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover/img:scale-[1.02]" style={{ willChange: "transform" }}/>
                 <div className="absolute inset-0 bg-black/10 group-hover/img:bg-transparent transition-colors duration-500" />
               </div>
               <div className="px-2">
                 <h3 className="font-serif text-lg md:text-xl text-foreground mb-1 group-hover:text-accent transition-colors truncate">{product.title}</h3>
                 <p className="text-xs uppercase tracking-widest text-foreground/40 mb-3">{product.category || 'Collection'}</p>
                 <p className="font-mono text-sm text-accent">{formatCurrency(product.price)}</p>
               </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── FEATURED COLLECTIONS ───────────────────────────────────────────────────
const FeaturedCollections = () => {
  const collections = [
    { title: "Velvet Season", category: "Winter '26", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80" },
    { title: "Noir Luxury", category: "Evening Wear", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80" },
    { title: "Heritage Silk", category: "Classic", image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80" }
  ];

  return (
    <section className="py-32 bg-background-secondary/10">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <span className="text-accent text-[9px] uppercase tracking-[0.5em] font-bold mb-4 block">Categories</span>
          <h2 className="font-serif text-4xl md:text-6xl text-foreground">Seasonal Edits</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col, i) => (
            <Link href="/shop" key={i} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-black">
              <img src={col.image} alt={col.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10">
                <span className="text-[10px] uppercase tracking-widest text-accent mb-2 block">{col.category}</span>
                <h3 className="font-serif text-3xl text-white">{col.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── STORY SECTION ──────────────────────────────────────────────────────────
const StorySection = () => {
  return (
    <section className="py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10">
            <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80" alt="Our Story" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -top-10 -left-10 w-40 h-40 border border-accent/20 rounded-full animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-accent/5 blur-3xl rounded-full" />
        </div>
        <div>
          <span className="text-accent text-[9px] uppercase tracking-[0.5em] font-bold mb-8 block">The Maison</span>
          <h2 className="font-serif text-4xl md:text-6xl text-foreground mb-10 leading-tight">Elevating Pakistan's Fashion Heritage</h2>
          <p className="text-foreground/50 text-lg leading-relaxed mb-12 font-sans">
            Wearition is more than a boutique; it is a celebration of craftsmanship. We bridge the gap between luxury brands and discerning visionaries, curating the finest resale pieces with an uncompromising eye for quality and authenticity.
          </p>
          <Link href="/about" className="inline-flex items-center gap-4 text-xs uppercase tracking-[0.3em] font-bold group">
            <span className="border-b border-foreground/30 pb-1 group-hover:border-accent group-hover:text-accent transition-all">Read Our Legacy</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform group-hover:text-accent" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── FOOTER ─────────────────────────────────────────────────────────────────
const Footer = () => {
  return (
    <footer className="bg-background-secondary pt-32 pb-20 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-serif text-4xl mb-8 tracking-tighter">WEARITION</h2>
            <p className="text-foreground/40 max-w-sm mb-10 uppercase text-[10px] tracking-[0.2em] leading-loose">
              Curating the world's most exquisite resale luxury. Pakistan's premier destination for high-end fashion visionaries.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-8">Navigation</h4>
            <ul className="space-y-4 text-xs uppercase tracking-widest text-foreground/50">
              <li><Link href="/shop" className="hover:text-accent transition-colors">Collections</Link></li>
              <li><Link href="/brands" className="hover:text-accent transition-colors">The Houses</Link></li>
              <li><Link href="/about" className="hover:text-accent transition-colors">Our Legacy</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition-colors">Concierge</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-8">Social</h4>
            <ul className="space-y-4 text-xs uppercase tracking-widest text-foreground/50">
              <li><a href="#" className="hover:text-accent transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-6">
          <p className="text-[9px] uppercase tracking-widest text-foreground/20">© 2026 Wearition Maison. All rights reserved.</p>
          <div className="flex gap-10 text-[9px] uppercase tracking-widest text-foreground/20">
            <Link href="/privacy" className="hover:text-foreground/50">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground/50">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
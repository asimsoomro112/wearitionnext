"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, limit } from "firebase/firestore";
import heroImg from "@/1.png";
import { BrandStory } from "../components/layout/BrandStory";
import { SEO } from "../components/layout/SEO";
import { TextReveal } from "../components/layout/TextReveal";
import { MagneticButton } from "../components/layout/MagneticButton";
import { WearitionSpinner } from "../components/layout/WearitionSpinner";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ACCENT = "var(--accent)";
const FALLBACK_IMG = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop";

const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = FALLBACK_IMG;
};

// ─── HERO CAROUSEL ─────────────────────────────────────────────────────────
const HeroCarousel = ({ products }: { products: any[] }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = products.length;
  const getIdx = (offset: number) => ((current + offset) % total + total) % total;

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    timerRef.current = setInterval(next, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  const variants = {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 45 : -45,
      x: direction > 0 ? 200 : -200,
      opacity: 0,
      z: -100,
      scale: 0.9
    }),
    center: {
      rotateY: 0,
      x: 0,
      opacity: 1,
      z: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: (direction: number) => ({
      rotateY: direction < 0 ? 45 : -45,
      x: direction < 0 ? 200 : -200,
      opacity: 0,
      z: -100,
      scale: 0.9,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  const cur = products[current];

  return (
    <section className="hero-section relative w-full h-[100dvh] flex items-center justify-center overflow-hidden bg-background perspective-[1500px]">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[10%] right-[10%] w-[50vw] h-[50vw] bg-accent blur-[150px] rounded-full" 
        />
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
      </div>

      <div className="container mx-auto px-5 md:px-12 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-20 items-center relative z-10 h-full py-16 lg:py-0">
        <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left h-full lg:justify-center lg:mt-0 mt-[-5vh]">
          <div className="min-h-[220px] md:min-h-[300px] flex flex-col justify-center w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full"
              >
                <div className="mb-4 md:mb-8">
                  <span className="inline-block px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-[9px] uppercase tracking-[0.4em] font-bold">
                    Maison Selection 2026
                  </span>
                </div>
                
                <h1 className="font-serif text-[9vw] sm:text-[7.5vw] lg:text-[6vw] text-foreground leading-[1.05] uppercase tracking-tighter mb-8 md:mb-10 max-w-[95%] mx-auto lg:mx-0">
                  {cur?.title || "The New Era"}
                </h1>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
                  <MagneticButton strength={0.1}>
                    <Link href={`/product/${cur?.id}`} className="group relative inline-flex items-center gap-3 px-10 py-5 bg-foreground text-background font-bold tracking-[0.2em] text-[10px] uppercase rounded-full overflow-hidden transition-all hover:bg-accent hover:text-white">
                      <span className="relative z-10">Shop Now</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </MagneticButton>
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1">Value</span>
                    <span className="text-foreground font-serif text-2xl tracking-widest">{formatCurrency(cur?.price || 0)}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6 mt-8 lg:mt-16">
            <div className="flex gap-2">
              <button onClick={prev} className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-border-color flex items-center justify-center text-foreground/30 hover:text-accent hover:border-accent transition-all bg-background-secondary/10">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-border-color flex items-center justify-center text-foreground/30 hover:text-accent hover:border-accent transition-all bg-background-secondary/10">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1.5 min-w-[130px]">
               <div className="flex justify-between text-[8px] text-foreground/20 uppercase tracking-[0.3em] font-bold">
                 <span>Lookbook</span>
                 <span>0{current + 1} / 0{total}</span>
               </div>
               <div className="h-[1.5px] w-full bg-border-color relative overflow-hidden rounded-full">
                 <motion.div 
                   key={current}
                   initial={{ scaleX: 0 }}
                   animate={{ scaleX: 1 }}
                   transition={{ duration: 7, ease: "linear" }}
                   className="absolute inset-0 bg-accent origin-left"
                 />
               </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 flex justify-center items-center h-[35vh] md:h-[45vh] lg:h-full relative preserve-3d">
          <div className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[480px] aspect-[3/4] preserve-3d">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                <div className="w-full h-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_-30px_rgba(0,0,0,0.5)] border border-border-color group">
                  <img 
                    src={cur?.images?.[0] || heroImg.src || heroImg} 
                    alt={cur?.title}
                    onError={onImgError}
                    className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-48 h-48 border border-accent/10 rounded-full animate-spin-slow pointer-events-none hidden lg:block" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden py-3 border-t border-border-color bg-background-secondary/30 backdrop-blur-sm z-20">
        <motion.div 
          className="flex gap-20 whitespace-nowrap text-[8px] uppercase tracking-[0.6em] text-foreground/15 font-bold"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <span>Luxury Tailoring • Pakistan's Finest • Maison Wearition • Sustainable Luxury • Bespoke Craftsmanship</span>
          <span>Luxury Tailoring • Pakistan's Finest • Maison Wearition • Sustainable Luxury • Bespoke Craftsmanship</span>
        </motion.div>
      </div>

      <style jsx global>{`
        .preserve-3d { transform-style: preserve-3d; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 25s linear infinite; }
      `}</style>
    </section>
  );
};

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
                 {product.images && product.images.length > 1 && (
                   <img src={product.images[1]} alt={`${product.name} alternate`} onError={onImgError} className="parallax-img absolute top-[-10%] left-0 w-full h-[120%] object-cover opacity-0 group-hover/img:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover/img:scale-[1.02]" style={{ willChange: "transform" }}/>
                 )}
               </div>
               <div className="flex justify-between items-start text-foreground">
                 <div>
                   <h3 className="font-serif text-[11px] sm:text-sm tracking-wide uppercase mb-1 truncate max-w-[200px]">{product.title || product.name}</h3>
                   <p className="opacity-70 text-xs sm:text-sm font-sans">{formatCurrency(product.price)}</p>
                 </div>
               </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [heroProducts, setHeroProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const brandSections = useMemo(() => {
    if (products.length === 0) return [];
    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    return brands.map(brand => ({
      id: `brand-${brand}`,
      type: 'products_scroll',
      title: `${brand} Collection`,
      productQueryType: 'brand',
      brandValue: brand
    }));
  }, [products]);

  useEffect(() => {
    async function fetchData() {
      const initialSections = [
        { id: 'sec-1', type: 'hero' },
        { id: 'sec-brands', type: 'brands_marquee' },
        { id: 'sec-5', type: 'editorial' },
        { id: 'sec-6', type: 'artisanship' },
        { id: 'sec-7', type: 'newsletter' },
      ];

      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("isPublished", "==", true));
        const productsSnap = await getDocs(q);
        const fetchedProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(fetchedProducts);

        const hq = query(productsRef, where("isPublished", "==", true), where("isFeatured", "==", true), limit(5));
        const heroSnap = await getDocs(hq);
        const fetchedHero = heroSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setHeroProducts(fetchedHero.length > 0 ? fetchedHero : fetchedProducts.slice(0, 5));

        const settingsSnap = await getDoc(doc(db, 'settings', 'homepage'));
        const dbSections = settingsSnap.exists() && settingsSnap.data().sections ? settingsSnap.data().sections : initialSections;
        
        setSections(dbSections);
      } catch (e: any) {
        setSections(initialSections);
        console.error("Firestore Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const finalSections = useMemo(() => {
    const combined = [...sections];
    if (brandSections.length > 0) {
      const heroIdx = combined.findIndex(s => s.type === 'hero');
      combined.splice(heroIdx + 1, 0, ...brandSections);
    }
    return combined;
  }, [sections, brandSections]);

  useEffect(() => {
    if (loading || finalSections.length === 0 || !isMounted) return;
    let ctx = gsap.context(() => {
      const parallaxContainers = gsap.utils.toArray(".parallax-container");
      parallaxContainers.forEach((container: any) => {
        const img = container.querySelector(".parallax-img");
        if (img) {
          gsap.to(img, {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom", 
              end: "bottom top", 
              scrub: 1,
            },
          });
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, finalSections, isMounted]);

  if (!isMounted || loading) return <WearitionSpinner />;

  const renderSection = (section: any, index: number) => {
    switch(section.type) {
      case 'hero':
        return <HeroCarousel key={section.id || index} products={heroProducts} />;
      case 'brands_marquee':
        return <BrandsMarquee key={section.id || index} />;
      case 'products_scroll':
        let filteredProducts = [...products];
        if (section.productQueryType === 'brand' && section.brandValue) {
          filteredProducts = filteredProducts.filter(p => p.brand === section.brandValue);
        } else if (section.productQueryType === 'sale') {
          filteredProducts = filteredProducts.filter(p => p.isOnSale && p.salePrice);
        } else if (section.productQueryType === 'category' && section.categoryValue) {
          filteredProducts = filteredProducts.filter(p => p.category?.toLowerCase() === section.categoryValue?.toLowerCase());
        } else if (section.productQueryType === 'featured' || section.productQueryType === 'trending') {
          filteredProducts = filteredProducts.filter(p => 
            p.isFeatured && (!section.categoryValue || p.category?.toLowerCase() === section.categoryValue?.toLowerCase())
          );
        }
        if (filteredProducts.length === 0) return null;
        return (
          <HorizontalScroller 
            key={section.id || index}
            title={section.title || ''} 
            products={filteredProducts} 
            sectionClass={`scroll-section-${index}`} 
            isSale={section.productQueryType === 'sale'}
          />
        );
      case 'editorial':
        return (
          <section key={section.id || index} className="editorial-section relative overflow-hidden w-full h-[90vh] flex items-center px-6 lg:px-24 my-16 bg-black">
            <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 opacity-40">
              {products.slice(0, 8).map((p, i) => (
                <div key={i} className="relative aspect-square overflow-hidden border-[0.5px] border-white/5">
                  <img src={p.images?.[0]} alt="" className="w-full h-full object-cover scale-110" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/30 pointer-events-none z-[1]"></div>
            <div className="relative z-[2] w-full max-w-2xl p-8 lg:p-14 bg-background/20 backdrop-blur-xl border border-white/10 text-foreground shadow-2xl rounded-sm">
              <span className="text-accent text-[10px] uppercase tracking-[0.5em] mb-4 block font-bold">Maison Editorial</span>
              <TextReveal as="h2" className="font-serif text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight text-white drop-shadow-lg">The Autumn Edit</TextReveal>
              <Link href="/editorial" className="inline-block uppercase tracking-[0.22em] text-[10px] border-b border-foreground pb-1 hover:opacity-60 transition-opacity text-white font-medium">Read Editorial</Link>
            </div>
          </section>
        );
      case 'artisanship':
        return (
          <section key={section.id || index} className="artisanship-section relative z-10 w-full py-20 md:py-36 px-6 md:px-12 bg-background-secondary overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-[0.05]">
              <img src="https://images.unsplash.com/photo-1590670845026-d66cc515bcb3?q=80&w=2000" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-[4/5] overflow-hidden shadow-2xl parallax-container rounded-xl">
                  <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1000" alt="Bespoke Clothing" className="parallax-img absolute top-[-10%] left-0 w-full h-[120%] object-cover" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <TextReveal as="h2" className="font-serif text-3xl md:text-4xl lg:text-6xl uppercase tracking-widest text-foreground mb-8 lg:mb-12 leading-tight">Mastering The Craft</TextReveal>
                <p className="text-foreground/60 text-sm mb-12 max-w-md leading-loose">Every thread, every stitch, and every fabric is chosen with uncompromising attention to detail. Our master tailors combine centuries-old techniques with modern precision to create garments that feel like a second skin.</p>
                <Link href="/about" className="inline-block uppercase text-[10px] tracking-[0.22em] text-foreground border border-foreground px-10 py-5 hover:bg-foreground hover:text-background transition-colors duration-300">Discover Our Process</Link>
              </div>
            </div>
          </section>
        );
      case 'newsletter':
        return (
          <section key={section.id || index} className="newsletter-section relative z-10 w-full py-24 md:py-40 px-6 flex items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0 z-0 opacity-15">
              <img src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=2000" alt="" className="w-full h-full object-cover grayscale blur-sm" />
              <div className="absolute inset-0 bg-background/85"></div>
            </div>
            <div className="max-w-xl w-full text-center relative z-10">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl uppercase tracking-widest text-foreground mb-6">Join the Community</h2>
              <form className="flex flex-col sm:flex-row border-b border-border-color pb-3 relative">
                <input type="email" placeholder="Enter your email address" className="bg-transparent border-none outline-none text-foreground flex-grow font-sans placeholder-foreground/30 px-2 py-2" required />
                <button type="submit" className="uppercase text-[9px] tracking-[0.2em] text-foreground hover:text-accent ml-4 font-medium mt-4 sm:mt-0">Subscribe</button>
              </form>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <SEO />
      <div className="fixed inset-0 z-[-3] bg-background transition-colors duration-500" />
      <div className="flex flex-col">
        {finalSections.map((section, index) => (
          <div key={section.id || `section-${index}`}>
            {renderSection(section, index)}
          </div>
        ))}
      </div>
      <BrandStory />
    </div>
  );
}
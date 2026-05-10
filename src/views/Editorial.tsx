"use client";
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { MagneticButton } from '../components/layout/MagneticButton';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { getOptimizedImage } from '@/lib/images';

export function Editorial() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 1.1]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, "products"), where("isPublished", "==", true), limit(20));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
      } catch (e) {
        console.error("Error fetching editorial products:", e);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-background min-h-screen text-foreground overflow-x-hidden">
      <SEO 
        title="Collections | WEARITION" 
        description="Explore Wearition's latest collections. A curation of premium luxury fashion, redefined for the modern visionary."
      />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ scale }}
          className="absolute inset-0 z-0"
        >
          {products.length > 0 ? (
            <img 
              src={getOptimizedImage(products[0].images?.[0] || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000")} 
              alt="Editorial Hero" 
              className="w-full h-full object-cover grayscale brightness-[0.3]"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-background-secondary animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
        </motion.div>

        <motion.div 
          style={{ opacity }}
          className="relative z-10 text-center px-6"
        >
          <span className="text-accent uppercase tracking-[0.4em] text-[10px] mb-6 block font-bold">New Season Arrivals</span>
          <TextReveal as="h1" className="font-serif text-5xl md:text-8xl lg:text-[12rem] text-white uppercase tracking-tighter leading-[0.9] mb-8 text-center drop-shadow-2xl">
            Identity
          </TextReveal>
          <p className="text-white/60 font-sans max-w-xl mx-auto text-xs md:text-sm leading-relaxed uppercase tracking-[0.3em] font-light">
            Luxury redefined through the lens of Pakistani heritage.
          </p>
        </motion.div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/30">
          <span className="text-[10px] uppercase tracking-[0.4em]">Discover Collection</span>
          <div className="w-px h-16 bg-gradient-to-b from-white/30 to-transparent"></div>
        </div>
      </section>

      {/* Infinite Scrolling Product Marquee */}
      <section className="py-12 md:py-24 border-y border-white/5 bg-background-secondary/10 relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute top-0 left-0 w-20 md:w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-20 md:w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        {products.length > 0 && (
          <div className="flex whitespace-nowrap animate-marquee hover:pause-marquee">
            {[...products, ...products, ...products].map((product, idx) => (
              <Link 
                key={`${product.id}-${idx}`}
                href={`/product/${product.id}`}
                className="inline-block mx-4 md:mx-8 group"
              >
                <div className="w-40 md:w-64 aspect-[3/4] overflow-hidden rounded-sm relative mb-4 bg-foreground/5">
                  <img 
                    src={getOptimizedImage(product.images?.[0])} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                </div>
                <h3 className="text-[9px] md:text-[10px] uppercase tracking-widest text-foreground font-bold group-hover:text-accent transition-colors">{product.title}</h3>
                <p className="text-[8px] md:text-[9px] text-foreground/40 uppercase tracking-widest mt-1">Rs. {product.price?.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Grid Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24 max-w-[1800px] mx-auto">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-5xl md:text-7xl text-foreground mb-8">Curated Curation</h2>
            <p className="text-foreground/50 text-sm md:text-base font-light tracking-wide leading-relaxed">
              Every piece in our collection is hand-selected to represent the pinnacle of modern luxury. From the finest fabrics to the most precise silhouettes, we redefine what it means to wear your identity.
            </p>
          </div>
          <Link href="/shop" className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent border-b border-accent pb-2 hover:opacity-70 transition-opacity">
            Explore All Products —&gt;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products.slice(0, 9).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              className={`relative group cursor-pointer ${idx % 3 === 1 ? 'lg:translate-y-20' : ''}`}
            >
              <Link href={`/product/${product.id}`}>
                <div className="aspect-[3/4] overflow-hidden rounded-sm relative">
                  <img 
                    src={getOptimizedImage(product.images?.[0])} 
                    alt={product.title}
                    className="w-full h-full object-cover md:grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-2">View Detail</p>
                    <h3 className="text-white text-2xl font-serif uppercase leading-none">{product.title}</h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Visual Quote Section */}
      <section className="py-40 bg-foreground/5 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-accent text-3xl font-serif mb-8 block font-italic">"</span>
          <h2 className="font-serif text-2xl md:text-5xl text-foreground leading-snug mb-12 italic">
            "Fashion is not just what you wear, it's the narrative you choose to tell the world about who you are."
          </h2>
          <div className="w-12 h-px bg-accent mx-auto mb-6"></div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-foreground/40">The Wearition Manifesto</span>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 md:py-48 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-accent block mb-6 font-bold">Join the Vision</span>
          <TextReveal as="h3" className="font-serif text-4xl md:text-8xl text-foreground mb-12 uppercase tracking-tighter text-center">
            Your Journey Starts Here
          </TextReveal>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <MagneticButton strength={0.2} as="div">
              <Link href="/shop" className="inline-block bg-foreground text-background px-16 py-6 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent hover:text-white transition-all duration-500 shadow-2xl rounded-full">
                Shop Everything
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.2} as="div">
              <Link href="/brands" className="inline-block border border-foreground/20 text-foreground px-16 py-6 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-white/5 transition-all duration-500 rounded-full">
                By Designer
              </Link>
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 40s linear infinite;
        }
        .hover\:pause-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

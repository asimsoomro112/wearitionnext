"use client";
import { motion } from 'framer-motion';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { Leaf, Recycle, Droplets } from 'lucide-react';

const BrandsMarquee = () => {
  const brands = [
    "Sana Safinaz", "Gul Ahmed", "Khaadi", "Maria.B", "Junaid Jamshed", "Sapphire", 
    "Alkaram Studio", "Nishat Linen", "Zara Shahjahan", "Elan", "Bareeze", "Cross Stitch"
  ];
  
  return (
    <section className="py-20 bg-background/50 overflow-hidden border-y border-border-color/30 my-20">
      <div className="container mx-auto px-6 mb-10 text-center">
        <span className="text-accent text-[9px] uppercase tracking-[0.4em] font-bold mb-4 block">Curated Excellence</span>
        <h2 className="font-serif text-2xl md:text-4xl text-foreground uppercase tracking-widest">Our Brand Partners</h2>
      </div>
      
      <div className="flex flex-col gap-10">
        <motion.div 
          animate={{ x: [0, -2000] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 whitespace-nowrap items-center"
        >
          {[...brands, ...brands].map((brand, i) => (
            <div key={i} className="flex items-center gap-6 group cursor-default">
              <span className="text-3xl md:text-5xl font-serif text-foreground/10 group-hover:text-accent transition-colors duration-500 uppercase tracking-tighter">
                {brand}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-accent/20" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export function Sustainability() {
  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-screen">
      <SEO title="Sustainability" description="Discover Wearition's commitment to ethical and sustainable luxury fashion through reselling." />
      <div className="max-w-[1000px] mx-auto">
        <header className="mb-20 text-center">
          <span className="text-accent text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Maison Commitment</span>
          <TextReveal as="h1" className="font-serif text-4xl sm:text-5xl md:text-7xl text-foreground mb-8">Sustainability</TextReveal>
          <div className="h-px w-32 bg-accent mx-auto"></div>
        </header>

        <div className="max-w-3xl mx-auto mb-32 text-center">
           <h2 className="font-serif text-3xl md:text-4xl mb-10">Conscious Reselling</h2>
           <p className="text-base text-foreground/60 leading-loose mb-12">
             At Wearition, we believe the most sustainable garment is the one already in existence. By curating and reselling the finest Pakistani labels, we extend the lifecycle of premium fashion and reduce the environmental impact of new production.
           </p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
              <div className="flex gap-5 p-8 border border-white/5 bg-background-secondary/10 rounded-sm">
                <Leaf className="w-6 h-6 text-accent flex-shrink-0" />
                <div>
                  <h3 className="uppercase text-[10px] tracking-widest font-bold mb-2 text-foreground">Zero-Waste Vision</h3>
                  <p className="text-xs text-foreground/50 leading-relaxed">Reselling allows us to bypass the resource-heavy manufacturing cycle and minimize environmental waste.</p>
                </div>
              </div>
              <div className="flex gap-5 p-8 border border-white/5 bg-background-secondary/10 rounded-sm">
                <Droplets className="w-6 h-6 text-accent flex-shrink-0" />
                <div>
                  <h3 className="uppercase text-[10px] tracking-widest font-bold mb-2 text-foreground">Responsible Luxury</h3>
                  <p className="text-xs text-foreground/50 leading-relaxed">We ensure that high-end fashion remains accessible without compromising our shared planetary values.</p>
                </div>
              </div>
           </div>
        </div>

        {/* Brands Marquee on Sustainability Page */}
        <BrandsMarquee />

        <div className="bg-background-secondary/20 p-12 md:p-20 text-center border border-white/5">
          <Recycle className="w-12 h-12 text-accent mx-auto mb-8" />
          <h2 className="font-serif text-3xl mb-6">A Circular Future</h2>
          <p className="text-sm text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            Every purchase of a pre-curated brand item is a step towards a fully circular economy. We are proud to provide a second life to the craftsmanship of Pakistan's greatest fashion houses.
          </p>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function Editorial() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  return (
    <div ref={containerRef} className="w-full bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ scale }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop" 
            alt="Autumn Editorial" 
            className="w-full h-full object-cover grayscale brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
        </motion.div>

        <motion.div 
          style={{ opacity }}
          className="relative z-10 text-center px-6"
        >
          <span className="text-white uppercase tracking-[0.4em] text-[10px] mb-6 block">Editorial Vol. 04</span>
          <h1 className="font-serif text-6xl md:text-8xl lg:text-[10rem] text-white uppercase tracking-tighter leading-none mb-8">
            Autumn<br />Edit
          </h1>
          <p className="text-white/80 font-sans max-w-xl mx-auto text-sm md:text-base leading-relaxed uppercase tracking-widest">
            A celebration of texture, silhouette, and the transition of light.
          </p>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/50">
          <span className="text-[10px] uppercase tracking-widest">Scroll to explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent"></div>
        </div>
      </section>

      {/* Narrative Section 1 */}
      <section className="py-32 md:py-48 px-6 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-10 leading-tight">
              Structured<br />Serenity
            </h2>
            <p className="text-foreground/70 font-sans leading-relaxed mb-8">
              This season, we explore the intersection of rigid architecture and fluid motion. Each piece is designed to hold its form while allowing the wearer to move with effortless grace. 
            </p>
            <p className="text-foreground/70 font-sans leading-relaxed italic border-l-2 border-accent pl-6">
              "The Autumn Edit is about finding balance in the chaos of change." — Creative Director
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="aspect-[3/4] bg-background-secondary overflow-hidden shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000" 
              alt="Editorial look 1" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
            />
          </motion.div>
        </div>
      </section>

      {/* Visual Break - Full Width */}
      <section className="h-[70vh] md:h-[90vh] w-full overflow-hidden relative">
        <img 
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000" 
          alt="Visual break" 
          className="w-full h-full object-cover fixed top-0 left-0 z-[-1] brightness-90"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </section>

      {/* Narrative Section 2 */}
      <section className="py-32 md:py-48 px-6 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-2 md:order-1 aspect-[3/4] bg-background-secondary overflow-hidden shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000" 
              alt="Editorial look 2" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-1 md:order-2"
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-10 leading-tight">
              Tactile<br />Poetry
            </h2>
            <p className="text-foreground/70 font-sans leading-relaxed mb-8">
              Wool, silk, and cashmere—the holy trinity of autumn. We've sourced the finest natural fibers to create a collection that feels as good as it looks. The color palette is drawn from the fading light of October evenings.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="aspect-square bg-[#3d3d3d] rounded-full" title="Charcoal"></div>
              <div className="aspect-square bg-[#7c6a5a] rounded-full" title="Taupe"></div>
              <div className="aspect-square bg-[#2c3e50] rounded-full" title="Midnight"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Closing Hero */}
      <section className="py-24 md:py-40 px-6 text-center border-t border-foreground/10">
        <h3 className="font-serif text-4xl md:text-6xl text-foreground mb-12 uppercase tracking-tight">
          Redefine Your Silhouette
        </h3>
        <button className="bg-foreground text-background px-16 py-6 uppercase text-xs tracking-[0.3em] font-bold hover:bg-accent hover:text-white transition-all duration-300 shadow-xl">
          Shop The Edit
        </button>
      </section>
    </div>
  );
}

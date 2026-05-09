import { motion } from 'framer-motion';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';

export function About() {
  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-[80vh]">
      <SEO 
        title="Our Story" 
        description="Learn about Wearition's vision to redefine elegance with quality, sustainability, and timeless design."
      />
      <div className="max-w-[800px] mx-auto">
        <header className="mb-12 text-center">
          <TextReveal as="h1" className="font-serif text-4xl sm:text-5xl md:text-[4rem] text-foreground mb-6 text-center">
            Our Story
          </TextReveal>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8 text-foreground/80 font-sans leading-relaxed"
        >
          <p>
            Welcome to Wearition. Founded with a vision to redefine elegance for the modern visionary, we believe that clothing is more than just fabric—it's an expression of your deepest ambitions and unyielding confidence.
          </p>
          <p>
            Our collections are carefully curated and crafted with an uncompromising dedication to quality, sustainability, and timeless design. Every piece is designed not just to be worn, but to be lived in, cherished, and passed down.
          </p>
          <p>
            We partner with artisans around the world to source the finest materials, ensuring that every garment meets our exacting standards. Wearition is more than a brand; it is a movement towards mindful consumption and enduring style.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

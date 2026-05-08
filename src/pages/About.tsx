import { motion } from 'framer-motion';

export function About() {
  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-[80vh]">
      <div className="max-w-[800px] mx-auto">
        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl sm:text-5xl md:text-[4rem] text-foreground mb-6"
          >
            Our Story
          </motion.h1>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8 text-foreground/80 font-sans leading-relaxed"
        >
          <p>
            Welcome to Wearition. Founded with a vision to redefine elegance for the modern woman, we believe that clothing is more than just fabric—it's an expression of your deepest ambitions and unyielding confidence.
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

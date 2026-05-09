import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';

export function BrandStory() {
  return (
    <section className="relative w-full py-24 md:py-40 px-6 overflow-hidden bg-background">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center">
        {/* Large Brand Logo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-16"
        >
          <img 
            src={typeof logo === 'string' ? logo : logo.src} 
            alt="Wearition Maison" 
            className="h-32 md:h-64 w-auto object-contain brightness-110" 
          />
        </motion.div>

        {/* Stylish Brand Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1 }}
          className="relative px-4 md:px-0"
        >
          <h2 className="font-['Great_Vibes'] text-4xl md:text-6xl text-accent mb-8">
            The Essence of Wearition
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="font-serif text-xl md:text-3xl lg:text-4xl leading-tight text-foreground uppercase tracking-wider">
              Where heritage meets the horizon of <span className="text-accent italic font-['Great_Vibes'] capitalize tracking-normal">modernity</span>.
            </p>
            <p className="font-sans text-sm md:text-base text-foreground/60 leading-relaxed max-w-2xl mx-auto">
              Founded on the principles of uncompromising quality and timeless silhouettes, 
              Wearition is more than a fashion house—it is a sanctuary for the sophisticated soul. 
              We curate experiences through fabric, blending the raw beauty of natural materials 
              with the precision of master craftsmanship.
            </p>
          </div>

          {/* Decorative Quote Mark */}
          <div className="absolute -top-10 -left-4 md:-left-12 text-9xl text-accent/10 font-serif pointer-events-none select-none">
            &ldquo;
          </div>
        </motion.div>

        {/* Aesthetic Divider */}
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: '100px' }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1 }}
          className="h-[1px] bg-accent mt-16"
        />
      </div>
      
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-accent/5 rounded-full blur-[120px] -z-10" />
    </section>
  );
}

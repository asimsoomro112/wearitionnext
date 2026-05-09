import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';

export function LoadingScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
    >
      <div className="relative flex flex-col items-center">
        {/* Logo with pulse and scale effect */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.05, 1],
            opacity: 1
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
          }}
          className="w-64 md:w-[500px] mb-12"
        >
          <img 
            src={typeof logo === 'string' ? logo : logo.src} 
            alt="Wearition Logo" 
            className="w-full h-auto object-contain brightness-125" 
          />
        </motion.div>

        {/* Loading Bar */}
        <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5, 
              ease: "easeInOut" 
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-accent shadow-[0_0_15px_rgba(212,175,140,0.5)]"
          />
        </div>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-[10px] uppercase tracking-[0.4em] text-white mt-6 font-light"
        >
          Elegance is Loading
        </motion.p>
      </div>

      {/* Decorative elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute bottom-12 text-[10px] uppercase tracking-[0.2em] text-white/20"
      >
        Maison Wearition &copy; 2026
      </motion.div>
    </motion.div>
  );
}

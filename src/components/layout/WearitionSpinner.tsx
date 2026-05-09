import { motion } from 'framer-motion';
import logo from '../../assets/navbar_logo.png';

export function WearitionSpinner() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
          className="w-32 md:w-[200px] mb-8"
        >
          <img src={typeof logo === 'string' ? logo : logo.src} alt="Wearition Logo" className="w-full h-auto object-contain" />
        </motion.div>
        <div className="w-24 h-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-1/2 bg-accent shadow-[0_0_15px_rgba(212,175,140,0.5)]"
          />
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
    >
      <div className="wearition-loader-wrapper">
        <div className="wearition-loader">
          <div className="outer-ring"></div>
          <div className="inner-ring"></div>

          <div className="logo-center">
            <span>W</span>
          </div>

          <div className="glow"></div>
        </div>

        <h1 className="brand-name">WEARITION</h1>
        <p className="brand-tagline">WEAR YOUR IDENTITY</p>
      </div>
    </motion.div>
  );
}

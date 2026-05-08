import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <>
      {/* Curtain Wipe */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname + '-curtain'}
          initial={{ scaleY: 0 }}
          animate={{ 
            scaleY: [0, 1, 1, 0] as any,
          }}
          transition={{ 
            duration: 0.8, 
            times: [0, 0.4, 0.6, 1],
            ease: "easeInOut"
          }}
          className="fixed inset-0 z-[9998] bg-foreground origin-bottom pointer-events-none"
        />
      </AnimatePresence>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

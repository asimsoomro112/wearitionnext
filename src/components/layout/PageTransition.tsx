import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

const curtainVariants = {
  initial: { scaleY: 0 },
  animate: { 
    scaleY: [0, 1, 1, 0],
    transition: { 
      duration: 0.8, 
      times: [0, 0.4, 0.6, 1],
      ease: [0.22, 1, 0.36, 1] 
    }
  }
};

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <>
      {/* Curtain Wipe */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname + '-curtain'}
          variants={curtainVariants}
          initial="initial"
          animate="animate"
          className="fixed inset-0 z-[9998] bg-foreground origin-bottom pointer-events-none"
        />
      </AnimatePresence>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

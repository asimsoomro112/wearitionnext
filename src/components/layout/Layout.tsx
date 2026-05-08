import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { MobileBottomBar } from './MobileBottomBar';
import { SearchOverlay } from './SearchOverlay';
import { AIStyleAssistant } from './AIStyleAssistant';
import { CustomCursor } from './CustomCursor';
import { PageTransition } from './PageTransition';
import { useEffect } from 'react';
import Lenis from 'lenis';

export function Layout() {
  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 1024 || 'ontouchstart' in window);

  useEffect(() => {
    if (isMobile) return; // Disable Lenis on mobile for better performance

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, [isMobile]);

  return (
    <div className={`min-h-screen bg-background-secondary text-foreground font-sans selection:bg-foreground selection:text-background-secondary flex flex-col lg:cursor-none ${isMobile ? 'pb-32' : ''}`}>
      <CustomCursor />
      <Navbar />
      <CartDrawer />
      <SearchOverlay />
      <AIStyleAssistant />
      <main className="flex-grow min-h-screen">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}

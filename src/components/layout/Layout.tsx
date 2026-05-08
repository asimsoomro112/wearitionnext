import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { MobileBottomBar } from './MobileBottomBar';
import { SearchOverlay } from './SearchOverlay';
import { AIStyleAssistant } from './AIStyleAssistant';
import { WhatsAppButton } from './WhatsAppButton';
import { CustomCursor } from './CustomCursor';
import { PageTransition } from './PageTransition';
import { useEffect } from 'react';
import Lenis from 'lenis';

export function Layout() {
  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen bg-background-secondary text-foreground font-sans selection:bg-foreground selection:text-background-secondary flex flex-col pb-16 md:pb-0 cursor-none lg:cursor-none">
      <CustomCursor />
      <Navbar />
      <CartDrawer />
      <SearchOverlay />
      <AIStyleAssistant />
      <WhatsAppButton />
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

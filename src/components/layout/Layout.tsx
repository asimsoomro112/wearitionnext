"use client";

import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { MobileBottomBar } from './MobileBottomBar';
import { SearchOverlay } from './SearchOverlay';
import { AIStyleAssistant } from './AIStyleAssistant';
import { CustomCursor } from './CustomCursor';
import { PageTransition } from './PageTransition';
import { MobileMenu } from './MobileMenu';
import { useEffect, useState } from 'react';
import Lenis from 'lenis';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
  }, []);

  useEffect(() => {
    if (isMobile) return;

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
      <MobileMenu />
      <SearchOverlay />
      <AIStyleAssistant />
      <main className="flex-grow min-h-screen">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}

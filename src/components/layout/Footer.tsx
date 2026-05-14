import Link from 'next/link';
import logo from '../../assets/logo.png';
import { MagneticButton } from './MagneticButton';

export function Footer() {
  return (
    <footer className="px-6 md:px-12 py-24 border-t border-foreground/5 mt-auto bg-background-secondary">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="mb-8 opacity-90 transition-all inline-block">
            <img src={typeof logo === 'string' ? logo : logo.src} alt="Wearition" className="h-32 md:h-48 w-auto object-contain brightness-110" />
          </div>
          <p className="text-sm text-foreground/50 max-w-sm font-sans leading-relaxed">
            Elegance redefined. Discover the latest in luxury fashion, crafted for the modern visionary.
          </p>
        </div>
        <div>
          <h3 className="uppercase text-[10px] tracking-[0.2em] font-medium mb-8 text-accent">Client Services</h3>
          <ul className="space-y-4 text-xs font-sans text-foreground/60">
            <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            <li><Link href="/track-order" className="hover:text-foreground transition-colors">Track Order</Link></li>
            <li><Link href="/returns" className="hover:text-foreground transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/shipping" className="hover:text-foreground transition-colors">Shipping</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="uppercase text-[10px] tracking-[0.2em] font-medium mb-8 text-accent">The House</h3>
          <ul className="space-y-4 text-xs font-sans text-foreground/60">
            <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
            <li><Link href="/sustainability" className="hover:text-foreground transition-colors">Sustainability</Link></li>
            <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
            <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto mt-24 pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase font-medium tracking-[0.2em] text-foreground/40">
        <p>&copy; 2026 Wearition. All rights reserved.</p>
        <div className="flex gap-8 mt-6 md:mt-0">
          <MagneticButton strength={0.3} as="div">
            <a href="https://www.instagram.com/_wearition?igsh=eG5obHgydGc3a2Vr" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors uppercase">Instagram</a>
          </MagneticButton>
          <MagneticButton strength={0.3} as="div">
            <a href="https://www.facebook.com/profile.php?id=61589494648557" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors uppercase">Facebook</a>
          </MagneticButton>
          <MagneticButton strength={0.3} as="div">
            <a href="https://www.tiktok.com/@wearition3?_r=1&_t=ZS-96Byntwejln" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors uppercase">TikTok</a>
          </MagneticButton>
        </div>
      </div>
    </footer>
  );
}

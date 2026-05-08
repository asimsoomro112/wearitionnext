import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export function Footer() {
  return (
    <footer className="px-6 md:px-12 py-24 border-t border-white/5 mt-auto bg-background-secondary">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="mb-8 opacity-90 transition-all inline-block">
            <img src={logo} alt="Wearition" className="h-10 md:h-12 w-auto object-contain brightness-110" />
          </div>
          <p className="text-sm text-foreground/50 max-w-sm font-sans leading-relaxed">
            Elegance redefined. Discover the latest in luxury women's fashion, crafted for the modern visionary.
          </p>
        </div>
        <div>
          <h3 className="uppercase text-[10px] tracking-[0.2em] font-medium mb-8 text-accent">Client Services</h3>
          <ul className="space-y-4 text-xs font-sans text-foreground/60">
            <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            <li><Link to="/track-order" className="hover:text-foreground transition-colors">Track Order</Link></li>
            <li><Link to="/contact" className="hover:text-foreground transition-colors">Returns & Exchanges</Link></li>
            <li><Link to="/contact" className="hover:text-foreground transition-colors">Shipping</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="uppercase text-[10px] tracking-[0.2em] font-medium mb-8 text-accent">The House</h3>
          <ul className="space-y-4 text-xs font-sans text-foreground/60">
            <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
            <li><Link to="/about" className="hover:text-foreground transition-colors">Sustainability</Link></li>
            <li><Link to="/contact" className="hover:text-foreground transition-colors">Careers</Link></li>
            <li><Link to="/about" className="hover:text-foreground transition-colors">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase font-medium tracking-[0.2em] text-foreground/40">
        <p>&copy; 2026. All rights reserved.</p>
        <div className="flex gap-8 mt-6 md:mt-0">
          <a href="#" className="hover:text-foreground transition-colors uppercase">Instagram</a>
          <a href="#" className="hover:text-foreground transition-colors uppercase">TikTok</a>
          <a href="#" className="hover:text-foreground transition-colors uppercase">Pinterest</a>
        </div>
      </div>
    </footer>
  );
}

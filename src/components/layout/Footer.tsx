import Link from 'next/link';
import logo from '../../assets/logo.png';

const SHOP_LINKS = [
  { label: 'Shop All', href: '/shop' },
  { label: 'Collections', href: '/editorial' },
  { label: 'Brands', href: '/brands' },
  { label: 'Wishlist', href: '/wishlist' },
];

const SUPPORT_LINKS = [
  { label: 'Track Order', href: '/track-order' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Contact', href: '/contact' },
];

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden mt-auto"
      style={{ background: 'linear-gradient(180deg, #030303 0%, #282828 100%)' }}
    >
      <div className="section-shell pt-20 md:pt-28 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-5">
            <Link href="/" className="inline-block">
              <img
                src={typeof logo === 'string' ? logo : logo.src}
                alt="Wearition"
                className="h-16 md:h-20 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-6 text-sm text-white/50 max-w-sm leading-relaxed">
              Wear your identity. Curated eastern and contemporary wear,
              delivered across Pakistan.
            </p>
            <a
              href="mailto:hello@wearition.store"
              className="mt-6 inline-block text-sm text-[#339e9b] hover:opacity-70 transition-opacity"
            >
              hello@wearition.store
            </a>
          </div>

          <div className="md:col-span-3">
            <h3 className="eyebrow text-white/40 mb-6">Shop</h3>
            <ul className="space-y-4">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm uppercase tracking-[0.14em] text-white/70 hover:text-white hover:-translate-y-0.5 inline-block transition-all"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="eyebrow text-white/40 mb-6">Support</h3>
            <ul className="space-y-4">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm uppercase tracking-[0.14em] text-white/70 hover:text-white hover:-translate-y-0.5 inline-block transition-all"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-8 mt-10">
              <a
                href="https://www.instagram.com/_wearition?igsh=eG5obHgydGc3a2Vr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.18em] text-white/50 hover:text-[#339e9b] transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61589494648557"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.18em] text-white/50 hover:text-[#339e9b] transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@wearition3?_r=1&_t=ZS-96Byntwejln"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.18em] text-white/50 hover:text-[#339e9b] transition-colors"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
          <p>&copy; 2026 Wearition. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </div>

      {/* giant bleeding wordmark */}
      <div className="relative select-none pointer-events-none" aria-hidden="true">
        <div className="font-display font-bold uppercase text-center leading-[0.8] text-white/[0.07] text-[clamp(80px,22vw,420px)] tracking-tight -mb-[0.12em]">
          Wearition
        </div>
      </div>
    </footer>
  );
}

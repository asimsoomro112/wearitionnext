"use client";
import { useRef, useEffect } from 'react';
import { getOptimizedImage } from '@/lib/images';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop';

function RollerCard({ product }: { product: any }) {
  const title = product.title || product.name || 'Wearition';
  return (
    <div
      data-roller-card
      className="relative w-[250px] md:w-[330px] h-[340px] md:h-[440px] flex-none rounded-xl overflow-hidden border border-white/10 mx-3 will-change-transform"
    >
      <img
        src={getOptimizedImage(product.images?.[0]) || FALLBACK_IMG}
        alt={title}
        loading="eager"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_IMG;
        }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-white text-xs font-medium truncate">{title}</p>
        <p className="text-white/55 text-[10px] uppercase tracking-[0.18em]">
          {product.category || 'New in'}
        </p>
      </div>
    </div>
  );
}

interface HeroRollerProps {
  products: any[];
}

/**
 * 3D curved roller strip — the reference template's signature hero treatment.
 * Cards travel on an infinite loop while each card bends away from the viewer
 * based on its distance from the container center (rotateY + push-back),
 * so the strip reads as a rotating roller rather than a flat marquee.
 *
 * The per-card transform is computed in a rAF loop from live bounding rects,
 * which keeps it correct under the CSS loop animation, the scroll-linked pan
 * applied by the parent, and viewport resizes — no manual bookkeeping.
 * Pauses when the hero is off-screen; fully static under
 * prefers-reduced-motion.
 */
export function HeroRoller({ products }: HeroRollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cards = (products || []).slice(0, 10);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(container);

    const els = Array.from(track.querySelectorAll<HTMLElement>('[data-roller-card]'));

    const update = () => {
      raf = requestAnimationFrame(update);
      if (!visible || els.length === 0) return;
      const cRect = container.getBoundingClientRect();
      const cx = cRect.left + cRect.width / 2;
      const half = Math.max(1, cRect.width / 2);
      for (const el of els) {
        const r = el.getBoundingClientRect();
        const dx = (r.left + r.width / 2 - cx) / half;
        const t = Math.max(-1.35, Math.min(1.35, dx));
        const abs = Math.abs(t);
        const rotY = -t * 58;
        const z = -abs * 220;
        const scale = 1 - Math.min(abs, 1) * 0.14;
        el.style.transform = `rotateY(${rotY.toFixed(2)}deg) translateZ(${z.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        el.style.zIndex = `${100 - Math.round(abs * 50)}`;
      }
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
      style={{ perspective: '1400px' }}
    >
      <div
        ref={trackRef}
        className="flex w-max animate-marquee-slow items-center py-6"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center shrink-0" aria-hidden={half === 1}>
            {cards.map((p) => (
              <RollerCard key={`${half}-${p.id}`} product={p} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Marquee } from './Marquee';
import { Reveal } from '@/components/Reveal';
import { getOptimizedImage } from '@/lib/images';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop';

/**
 * Measures the heading at a reference size, then scales it so the full word
 * always fits exactly within the viewport width — regardless of font metrics
 * (Syne is a very wide display face, so vw-only sizing overflowed and clipped
 * the word on both edges). Re-fits on resize and once webfonts finish loading.
 */
function useFitText(ref: React.RefObject<HTMLHeadingElement | null>, targetVw = 0.98) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const fit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const node = ref.current;
        if (!node) return;
        node.style.fontSize = '100px';
        const w = node.scrollWidth || 1;
        const target = Math.min(window.innerWidth * targetVw, 2200);
        node.style.fontSize = `${Math.max(28, (100 * target) / w)}px`;
      });
    };
    fit();
    window.addEventListener('resize', fit);
    // Syne loads async — re-measure once the real font metrics apply.
    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => { if (!cancelled) fit(); }).catch(() => {});
    }
    // Fallback: re-fit shortly after mount in case fonts.ready resolves early.
    const t = setTimeout(fit, 1200);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fit);
      clearTimeout(t);
    };
  }, [ref, targetVw]);
}

interface HomeHeroProps {
  products: any[];
}

function HeroCard({ product }: { product: any }) {
  const title = product.title || product.name || 'Wearition';
  return (
    <div className="relative w-[240px] md:w-[285px] h-[320px] md:h-[380px] flex-none rounded-xl overflow-hidden border border-white/10 mx-3">
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

export function HomeHero({ products }: HomeHeroProps) {
  const cards = (products || []).slice(0, 10);
  const h1Ref = useRef<HTMLHeadingElement | null>(null);
  // Bulletproof full-word fit: measured at runtime, never clipped.
  useFitText(h1Ref, 0.97);

  // Scroll-linked parallax: content drifts up and fades, cards lag behind,
  // the giant outline word slides sideways — depth while scrolling.
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const styleX = useTransform(scrollYProgress, [0, 1], ['0%', '-14%']);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* grid backdrop */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '88px 88px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 75%)',
        }}
      />

      {/* faint giant outline text — drifts sideways on scroll */}
      <motion.div style={{ x: styleX }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-extrabold uppercase text-outline whitespace-nowrap text-[26vw] leading-none select-none"
        >
          Style
        </div>
      </motion.div>

      {/* scrolling product marquee behind content — lags on scroll */}
      {cards.length > 0 && (
        <motion.div style={{ y: cardsY }} className="absolute inset-0 flex items-center opacity-70">
          <Marquee slow className="[mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            {cards.map((p) => (
              <HeroCard key={p.id} product={p} />
            ))}
          </Marquee>
        </motion.div>
      )}

      {/* dark veil so text stays readable */}
      <div className="absolute inset-0 bg-[#030303]/55 pointer-events-none" />

      {/* content — drifts up and fades on scroll */}
      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 w-full pt-28 pb-20">
      <div className="text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex"
        >
          <span className="glass rounded-full px-6 py-2.5 text-[13px] font-semibold uppercase tracking-[0.28em] text-[#39dde6] border border-[#00ffff2e]">
            Wear your identity
          </span>
        </motion.div>

        {/* Giant wordmark — runtime-measured to fit the viewport exactly.
            The old vw-only sizing overflowed because Syne is a very wide face,
            clipping the W and N at the viewport edges. */}
        <Reveal delay={0.12} immediate className="mt-8 w-full">
          <h1
            ref={h1Ref}
            className="font-display font-extrabold uppercase text-white leading-[0.85] tracking-tight whitespace-nowrap text-center text-[11vw]"
            style={{
              textShadow: '0 0 6px #ffffff38, 0 0 18px #ffffff1f',
            }}
          >
            Wearition
          </h1>
        </Reveal>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-white/70 text-base md:text-xl font-light tracking-wide"
        >
          Eastern craft. Contemporary cuts.
          <br className="hidden md:block" /> Delivered across Pakistan.
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 h-px w-[120px] bg-gradient-to-r from-transparent via-[#339e9b] to-transparent"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/shop" className="btn-primary">
            Shop now <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/editorial" className="btn-secondary">
            Explore
          </Link>
        </motion.div>
      </div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
        />
      </motion.div>
    </section>
  );
}

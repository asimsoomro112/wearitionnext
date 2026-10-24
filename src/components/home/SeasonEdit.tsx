'use client';

import Link from 'next/link';
import { ProductCard } from '../shop/ProductCard';

interface SeasonEditProps {
  eyebrow: string;
  title: string;
  blurb: string;
  products?: any[];
  keywords: string[];
  viewAllHref: string;
  viewAllLabel: string;
}

// Newest first: admin-created products carry createdAt (serverTimestamp);
// older docs without it sort last instead of being dropped.
const createdTime = (p: any): number => {
  const c = p.createdAt;
  if (!c) return 0;
  if (typeof c.seconds === 'number') return c.seconds * 1000;
  if (typeof c === 'string') return Date.parse(c) || 0;
  if (typeof c.toMillis === 'function') return c.toMillis();
  return 0;
};

export function SeasonEdit({ eyebrow, title, blurb, products = [], keywords, viewAllHref, viewAllLabel }: SeasonEditProps) {
  const matches = (p: any) => {
    const hay = `${p.title || ''} ${p.description || ''}`.toLowerCase();
    return keywords.some((k) => hay.includes(k));
  };

  // Dynamic by design: every newly published suit that matches the keywords
  // joins this section automatically — no manual curation per drop.
  const items = [...(products || [])]
    .filter(matches)
    .sort((a, b) => createdTime(b) - createdTime(a))
    .slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="relative w-full bg-[#030303] text-[#fafafa] py-24 md:py-32 px-6 md:px-12 border-t border-white/5 overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#adadad] font-mono">
            {eyebrow}
          </span>
          <Link href={viewAllHref} className="font-mono text-xs uppercase tracking-[0.2em] text-[#adadad] hover:text-white transition-colors">
            {viewAllLabel} ↗
          </Link>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase mb-4" style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}>
          {title}
        </h2>
        <p className="text-sm text-[#adadad] max-w-xl leading-relaxed mb-12">
          {blurb}
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

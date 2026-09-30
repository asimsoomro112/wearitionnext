"use client";
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeader } from './SectionHeader';
import { ProductCard } from '@/components/shop/ProductCard';

interface BestsellersProps {
  products: any[];
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Bestsellers({ products }: BestsellersProps) {
  const items = (products || []).slice(0, 8);
  const gridRef = useRef<HTMLDivElement>(null);
  // useInView + animate (not whileInView): the stagger reliably fires once
  // the grid enters the viewport, even under Lenis smooth scrolling.
  const inView = useInView(gridRef, { once: true, margin: '-80px' });
  if (items.length === 0) return null;

  return (
    <section className="py-24 md:py-36">
      <div className="section-shell">
        <SectionHeader
          index="01"
          eyebrow="Bestsellers"
          title="Most loved right now"
          intro="Handpicked pieces from our latest collection."
          linkHref="/shop"
          linkLabel="Shop all"
        />
        <motion.div
          ref={gridRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
        >
          {items.map((p, i) => (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, y: 44 },
                show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
              }}
            >
              <ProductCard product={p} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

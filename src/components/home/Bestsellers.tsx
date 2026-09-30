import { SectionHeader } from './SectionHeader';
import { ProductCard } from '@/components/shop/ProductCard';

interface BestsellersProps {
  products: any[];
}

export function Bestsellers({ products }: BestsellersProps) {
  const items = (products || []).slice(0, 8);
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

import { Marquee } from './Marquee';
import { FadeUp } from '@/components/Reveal';

const BRANDS = [
  'Gul Ahmed',
  'Khaadi',
  'Sapphire',
  'Maria.B',
  'Junaid Jamshed',
  'Nishat Linen',
  'Alkaram',
  'Bareeze',
];

export function BrandsMarquee() {
  return (
    <section className="py-16 md:py-20 border-y border-white/[0.07] overflow-hidden">
      <FadeUp y={28}>
        <p className="eyebrow text-accent text-center mb-10">Premium brands we resell</p>
      </FadeUp>
      <FadeUp delay={0.1} y={28}>
      <Marquee className="[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        {BRANDS.map((b) => (
          <span key={b} className="flex items-center shrink-0">
            <span className="font-display font-bold uppercase tracking-tight text-4xl md:text-6xl text-white/10 hover:text-accent transition-colors duration-500 px-8 whitespace-nowrap">
              {b}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#339e9b]/40 shrink-0" />
          </span>
        ))}
      </Marquee>
      </FadeUp>
    </section>
  );
}

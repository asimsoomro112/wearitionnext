import Link from 'next/link';
import { Reveal } from '@/components/Reveal';

interface SectionHeaderProps {
  index: string;
  eyebrow: string;
  title: string;
  intro?: string;
  linkHref?: string;
  linkLabel?: string;
}

export function SectionHeader({ index, eyebrow, title, intro, linkHref, linkLabel }: SectionHeaderProps) {
  return (
    <div className="mb-12 md:mb-16">
      <div className="flex items-start justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm text-white/40 tracking-[0.2em]">[{index}]</span>
            <span className="eyebrow text-accent">{eyebrow}</span>
          </div>
          <Reveal as="div">
            <h2 className="font-display font-bold uppercase tracking-tight leading-[1.05] text-4xl md:text-6xl text-foreground max-w-3xl">
              {title}
            </h2>
          </Reveal>
        </div>
        {(intro || linkHref) && (
          <div className="hidden md:block max-w-xs text-right shrink-0 pt-1">
            {intro && <p className="text-sm text-muted leading-relaxed mb-4">{intro}</p>}
            {linkHref && (
              <Link
                href={linkHref}
                className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.12em] text-accent hover:opacity-70 transition-opacity"
              >
                {linkLabel || 'Explore'} <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        )}
      </div>
      {linkHref && (
        <Link
          href={linkHref}
          className="md:hidden inline-flex items-center gap-1 mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-accent"
        >
          {linkLabel || 'Explore'} <span aria-hidden="true">↗</span>
        </Link>
      )}
    </div>
  );
}

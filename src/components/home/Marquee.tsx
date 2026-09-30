"use client";
import { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  slow?: boolean;
  className?: string;
}

/** Infinite horizontal marquee. Content is duplicated for a seamless loop. */
export function Marquee({ children, slow = false, className = '' }: MarqueeProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`flex w-max ${slow ? 'animate-marquee-slow' : 'animate-marquee'}`}>
        <div className="flex items-center shrink-0">{children}</div>
        <div className="flex items-center shrink-0" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

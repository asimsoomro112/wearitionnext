"use client";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "span" | "div";
  /**
   * When true, plays the entrance immediately with `animate` instead of
   * waiting for the element to enter the viewport. Use for above-the-fold
   * content (e.g. hero): viewport-triggered entrances can misfire on elements
   * that are already in view at mount, leaving them stuck hidden.
   */
  immediate?: boolean;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Line-mask text reveal — the template's signature entrance.
 * Each line slides up from an overflow mask with an expo-out ease.
 *
 * Uses `useInView` + `animate` (not `whileInView`) so the entrance reliably
 * fires exactly once, including for elements mounted while already visible.
 */
export function Reveal({ children, delay = 0, className = "", as = "span", immediate = false }: RevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const Tag = as === "div" ? motion.div : motion.span;
  const play = immediate || inView;

  return (
    <span ref={ref} className={`block overflow-hidden ${className}`}>
      <Tag
        className="block will-change-transform"
        initial={{ y: "112%" }}
        animate={play ? { y: "0%" } : { y: "112%" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </Tag>
    </span>
  );
}

/**
 * Fade-up reveal for blocks/cards — same expo-out language, no mask.
 */
export function FadeUp({
  children,
  delay = 0,
  className = "",
  y = 32,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

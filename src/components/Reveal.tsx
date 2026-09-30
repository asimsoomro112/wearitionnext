"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "span" | "div";
  /**
   * When true, plays the entrance immediately with `animate` instead of
   * waiting for `whileInView`. Use for above-the-fold content (e.g. hero):
   * `whileInView` can misfire on elements that are already in view at mount,
   * leaving them stuck at the hidden start state.
   */
  immediate?: boolean;
}

/**
 * Line-mask text reveal — the template's signature entrance.
 * Each line slides up from an overflow mask with an expo-out ease.
 */
export function Reveal({ children, delay = 0, className = "", as = "span", immediate = false }: RevealProps) {
  const Tag = as === "div" ? motion.div : motion.span;
  // whileInView for scroll-triggered sections; animate for above-the-fold.
  const triggerProps = immediate
    ? { animate: { y: "0%" } }
    : { whileInView: { y: "0%" }, viewport: { once: true, margin: "-40px" } };
  return (
    <span className={`block overflow-hidden ${className}`}>
      <Tag
        className="block will-change-transform"
        initial={{ y: "112%" }}
        {...triggerProps}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </Tag>
    </span>
  );
}

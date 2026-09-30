"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "span" | "div";
}

/**
 * Line-mask text reveal — the template's signature entrance.
 * Each line slides up from an overflow mask with an expo-out ease.
 */
export function Reveal({ children, delay = 0, className = "", as = "span" }: RevealProps) {
  const Tag = as === "div" ? motion.div : motion.span;
  return (
    <span className={`block overflow-hidden ${className}`}>
      <Tag
        className="block will-change-transform"
        initial={{ y: "112%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </Tag>
    </span>
  );
}

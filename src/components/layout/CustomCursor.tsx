"use client";
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Only show on desktop
    const checkDevice = () => setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Smooth follow with RAF
    const animate = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      cursorX += dx * 0.15;
      cursorY += dy * 0.15;
      if (cursor) {
        cursor.style.transform = `translate3d(${cursorX - 20}px, ${cursorY - 20}px, 0)`;
      }
      requestAnimationFrame(animate);
    };
    const frameId = requestAnimationFrame(animate);

    // Detect hoverable elements
    const handleElementHover = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a, button, [data-cursor]');
      if (link) {
        setIsHovering(true);
        const text = link.getAttribute('data-cursor') || '';
        setCursorText(text);
      }
    };

    const handleElementLeave = () => {
      setIsHovering(false);
      setCursorText('');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleElementHover);
    document.addEventListener('mouseout', handleElementLeave);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('mouseout', handleElementLeave);
    };
  }, [isMobile, isVisible]);

  if (isMobile) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
      style={{ 
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      <motion.div
        animate={{
          width: isHovering ? 80 : 40,
          height: isHovering ? 80 : 40,
          borderRadius: '50%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex items-center justify-center border border-white bg-white/10 backdrop-blur-sm"
      >
        {cursorText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-white text-[9px] uppercase tracking-[0.2em] font-bold"
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}

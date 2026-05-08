import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'button' | 'div';
  strength?: number;
}

export function MagneticButton({ 
  children, 
  className = '', 
  onClick,
  as: Tag = 'button',
  strength = 0.3
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || window.innerWidth < 1024) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * strength;
    const dy = (e.clientY - centerY) * strength;
    setPosition({ x: dx, y: dy });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  const Component = motion[Tag] as any;

  return (
    <Component
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 250, damping: 15, mass: 0.5 }}
    >
      {children}
    </Component>
  );
}

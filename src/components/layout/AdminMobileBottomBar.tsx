"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

export function AdminMobileBottomBar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  const handleClick = () => {
    triggerHaptic('light');
  };

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-[440px]">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/80 backdrop-blur-2xl rounded-[2rem] px-4 py-2 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link 
              key={item.name}
              href={item.path}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 ${
                active 
                  ? 'text-[#0a0a0a] bg-black/5' 
                  : 'text-[#0a0a0a]/30 active:text-[#0a0a0a] active:bg-black/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform duration-300`} />
              <span className={`text-[7px] mt-1 uppercase tracking-[0.15em] font-bold ${active ? 'opacity-100' : 'opacity-60'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}

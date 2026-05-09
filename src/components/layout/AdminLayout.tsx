"use client";
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import logo from '../../assets/logo.png';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const menuItems = [
    { name: 'Overview', path: '/admin', end: true },
    { name: 'Storefront', path: '/admin/storefront' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Analytics', path: '/admin/analytics' },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] text-[#0a0a0a] font-sans selection:bg-[#0a0a0a] selection:text-[#FDFDFD]">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white border-b border-black/10 flex items-center justify-between px-6 z-40">
        <Link href="/" className="flex items-center">
          <img src={typeof logo === 'string' ? logo : logo.src} alt="Wearition" className="h-14 w-auto object-contain brightness-110" />
        </Link>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white border-r border-black/10 flex flex-col z-50 lg:hidden"
            >
              <div className="h-20 border-b border-black/10 flex items-center justify-between px-6">
                <img src={typeof logo === 'string' ? logo : logo.src} alt="Wearition" className="h-14 w-auto object-contain brightness-110" />
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-[#0a0a0a]/60" />
                </button>
              </div>
              <nav className="flex flex-col gap-2 w-full px-4 py-6 mb-auto">
                {menuItems.map((item) => {
                  const isActive = item.end ? pathname === item.path : pathname.startsWith(item.path);
                  return (
                    <Link 
                      key={item.name} 
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-4 py-3 text-sm tracking-wide rounded-md transition-colors ${isActive ? 'bg-black/5 font-medium text-[#0a0a0a]' : 'text-[#0a0a0a]/60 hover:text-[#0a0a0a] hover:bg-black/5'}`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="w-full px-4 mt-auto pb-6">
                <div className="border-t border-black/10 pt-6">
                  <p className="px-4 text-xs font-medium text-[#0a0a0a] mb-4 truncate">{user?.email}</p>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-black/10 hidden lg:flex flex-col items-center py-10 fixed h-screen bg-white z-30">
        <Link href="/" className="w-full px-6 mb-16 flex items-center justify-center">
          <img src={typeof logo === 'string' ? logo : logo.src} alt="Wearition" className="h-24 w-auto object-contain brightness-110" />
        </Link>
        <nav className="flex flex-col gap-2 w-full px-4 mb-auto">
           {menuItems.map((item) => {
             const isActive = item.end ? pathname === item.path : pathname.startsWith(item.path);
             return (
               <Link 
                 key={item.name} 
                 href={item.path} 
                 className={`px-4 py-3 text-sm tracking-wide rounded-md hover:bg-black/5 ${isActive ? 'bg-black/5 font-medium text-[#0a0a0a]' : 'text-[#0a0a0a]/60 hover:text-[#0a0a0a]'}`}
               >
                 {item.name}
               </Link>
             );
           })}
        </nav>

        <div className="w-full px-4 mt-auto">
          <div className="border-t border-black/10 pt-6">
            <p className="px-4 text-xs font-medium text-[#0a0a0a] mb-4 truncate">{user?.email}</p>
            <button 
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 pt-24 lg:p-12 lg:ml-64 lg:pt-12 bg-[#FDFDFD] w-full max-w-[100vw]">
        {children}
      </main>
    </div>
  );
}

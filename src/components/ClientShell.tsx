"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { isAdminEmail } from "@/config/admin";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { AIStyleAssistant } from "@/components/layout/AIStyleAssistant";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { LenisProvider } from "@/components/layout/LenisProvider";

import { usePathname } from "next/navigation";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const { setUser, setIsAdmin, setLoading } = useAuthStore();
  const { initTheme } = useUIStore();

  useEffect(() => {
    // Restore saved theme preference
    initTheme();

    // Auth state resolves in the background — it must never block the
    // storefront from rendering (previously every page mount waited on
    // this listener behind a full-screen loading screen).
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setIsAdmin(isAdminEmail(user.email));
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setIsAdmin, setLoading, initTheme]);

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ className: "font-sans" }} />
      {children}
    </>
  );
}

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPDP = pathname.includes('/product/');

  return (
    <LenisProvider>
      <Navbar />
      <CartDrawer />
      <MobileMenu />
      <SearchOverlay />
      <main className="min-h-screen">{children}</main>
      <Footer />
      {!isPDP && <MobileBottomBar />}
      <WhatsAppButton />
      <AIStyleAssistant />
    </LenisProvider>
  );
}

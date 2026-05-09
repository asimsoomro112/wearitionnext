"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { isAdminEmail } from "@/config/admin";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { AIStyleAssistant } from "@/components/layout/AIStyleAssistant";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const { setUser, setIsAdmin, setLoading } = useAuthStore();
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setIsAdmin(isAdminEmail(user.email));
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
      setTimeout(() => setAppLoading(false), 1500);
    });
    return () => unsubscribe();
  }, [setUser, setIsAdmin, setLoading]);

  return (
    <>
      <AnimatePresence mode="wait">
        {appLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>

      <Toaster position="bottom-right" toastOptions={{ className: "font-sans" }} />

      {!appLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}

export function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <MobileMenu />
      <SearchOverlay />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <MobileBottomBar />
      <AIStyleAssistant />
    </>
  );
}

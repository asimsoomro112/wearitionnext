/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Home } from './pages/Home';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { isAdminEmail } from './config/admin';
import { ScrollToTop } from './components/layout/ScrollToTop';

// Lazy-loaded routes for code splitting
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const Account = lazy(() => import('./pages/Account').then(m => ({ default: m.Account })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderTracking = lazy(() => import('./pages/OrderTracking').then(m => ({ default: m.OrderTracking })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Editorial = lazy(() => import('./pages/Editorial').then(m => ({ default: m.Editorial })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminOrders = lazy(() => import('./pages/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminUsers = lazy(() => import('./pages/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminStorefront = lazy(() => import('./pages/AdminStorefront').then(m => ({ default: m.AdminStorefront })));

// Minimal route loading spinner
function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-t border-accent rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/30">Loading</p>
      </div>
    </div>
  );
}

// Protected Route Component for Admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuthStore();
  
  if (isLoading) return null;
  if (!user || !isAdmin) return <Navigate to="/account" replace />;
  
  return <>{children}</>;
}

export default function App() {
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
      
      // Artificial delay to show premium loader and ensure hydration
      setTimeout(() => {
        setAppLoading(false);
      }, 2500);
    });

    return () => unsubscribe();
  }, [setUser, setIsAdmin, setLoading]);

  return (
    <>
      <AnimatePresence mode="wait">
        {appLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      
      <Toaster position="bottom-right" toastOptions={{ className: 'font-sans' }} />
      
      {!appLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <ErrorBoundary>
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<RouteLoader />}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="product/:id" element={<ProductDetails />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="account" element={<Account />} />
                    <Route path="track-order" element={<OrderTracking />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="editorial" element={<Editorial />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="storefront" element={<AdminStorefront />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </motion.div>
      )}
    </>
  );
}

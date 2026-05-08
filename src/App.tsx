/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { AdminUsers } from './pages/AdminUsers';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { AdminStorefront } from './pages/AdminStorefront';
import { Wishlist } from './pages/Wishlist';
import { Account } from './pages/Account';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { isAdminEmail } from './config/admin';

// Protected Route Component for Admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuthStore();
  
  if (isLoading) return null; // Let the global loader handle it
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
      <BrowserRouter>
        <ScrollToTop />
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
      </BrowserRouter>
    </>
  );
}

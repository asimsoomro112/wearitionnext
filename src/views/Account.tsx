"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  ShoppingBag,
  UserCircle,
  History,
  LogOut,
  LayoutDashboard,
  KeyRound,
  Package,
  Clock,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import { generateOTP, saveOTP, verifyOTP } from '@/lib/otpService';
import { sendVerificationOTPEmail, sendPasswordResetOTPEmail } from '@/lib/emailService';

type AuthView = 'login' | 'signup' | 'verify' | 'forgot' | 'reset';

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export function Account() {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  const { user, isAdmin, isLoading } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingAction(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingAction(true);
    try {
      const code = generateOTP();
      await saveOTP(email, code, 'verification');
      await sendVerificationOTPEmail({ name: firstName, email, code });
      setView('verify');
      toast.success('Verification code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingAction(true);
    try {
      const res = await verifyOTP(email, otp, 'verification');
      if (!res.success) throw new Error(res.message);
      
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` });
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: cred.user.email,
        displayName: `${firstName} ${lastName}`,
        role: 'user',
        createdAt: serverTimestamp(),
      }, { merge: true });
      
      toast.success('Welcome to WEARITION! Account verified.');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleInitiateReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingAction(true);
    try {
      const code = generateOTP();
      await saveOTP(email, code, 'password_reset');
      await sendPasswordResetOTPEmail({ email, code });
      setView('reset');
      toast.success('Reset code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingAction(true);
    try {
      const res = await verifyOTP(email, otp, 'password_reset');
      if (!res.success) throw new Error(res.message);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset password');
      
      toast.success('Password updated! You can now sign in.');
      setView('login');
      setPassword('');
      setNewPassword('');
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoadingAction(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || 'Google Auth error');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoadingAction(true);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingAction(false);
    }
  };

  useEffect(() => {
    async function fetchUserOrders() {
      if (!user) return;
      setIsOrdersLoading(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setUserOrders(orders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsOrdersLoading(false);
      }
    }
    if (user) fetchUserOrders();
  }, [user]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // LOGGED IN: PATRON DASHBOARD
  if (user) {
    return (
      <div className="w-full min-h-screen pt-32 md:pt-40 px-6 md:px-12 pb-32 bg-[#050505] text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/10">
            <div>
              <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-white/40 mb-2">
                [01] • PATRON DASHBOARD
              </p>
              <h1 className="font-serif text-3xl md:text-5xl tracking-tight text-white">
                Welcome back, {user.displayName?.split(' ')[0] || 'Patron'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.03] text-white/70">
                Atelier Member
              </span>
              <button
                onClick={handleSignOut}
                className="text-[10px] uppercase font-mono tracking-[0.2em] px-3.5 py-1.5 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all flex items-center gap-2"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* Sidebar / Navigation */}
            <aside className="lg:col-span-4">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/80">
                    <UserCircle className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate text-sm">
                      {user.displayName || 'Patron'}
                    </p>
                    <p className="text-white/40 text-xs font-mono truncate">{user.email}</p>
                  </div>
                </div>

                <nav className="space-y-1.5 font-mono text-[10px] uppercase tracking-[0.2em]">
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all ${
                      activeTab === 'orders' 
                        ? 'bg-white text-black font-semibold shadow-lg' 
                        : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <History className="w-3.5 h-3.5" />
                      <span>Order Archive</span>
                    </div>
                    <span className="opacity-60">[{userOrders.length}]</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all ${
                      activeTab === 'profile' 
                        ? 'bg-white text-black font-semibold shadow-lg' 
                        : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Profile & Credentials</span>
                    </div>
                  </button>

                  {isAdmin && (
                    <Link 
                      href="/admin"
                      className="w-full flex items-center justify-between px-4 py-3 rounded-sm text-white/80 border border-white/10 hover:border-white/30 hover:bg-white/[0.03] transition-all pt-3 mt-4"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                  )}
                </nav>

                <div className="pt-6 border-t border-white/5">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-sm">
                    <p className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 mb-1">
                      Concierge Support
                    </p>
                    <p className="text-xs text-white/60 font-sans leading-relaxed mb-3">
                      Need bespoke tailoring or order assistance?
                    </p>
                    <a
                      href="https://wa.me/923333744318?text=Hello%20WEARITION%20Concierge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] uppercase font-mono tracking-[0.2em] text-white hover:underline"
                    >
                      <span>Connect via WhatsApp ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Pane */}
            <main className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {activeTab === 'orders' ? (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                      <h2 className="font-serif text-2xl tracking-tight text-white">Acquisition History</h2>
                      <Link 
                        href="/shop" 
                        className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        Explore Atelier <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {isOrdersLoading ? (
                      <div className="py-24 text-center">
                        <div className="w-6 h-6 border border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/40">
                          Retrieving Order Manifests...
                        </p>
                      </div>
                    ) : userOrders.length === 0 ? (
                      <div className="bg-[#0a0a0a] border border-white/5 rounded-sm p-16 text-center">
                        <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4 stroke-1" />
                        <h3 className="font-serif text-2xl mb-2 text-white">No Orders on Record</h3>
                        <p className="text-white/40 text-xs font-sans max-w-sm mx-auto mb-8 leading-relaxed">
                          Your acquisition portfolio is currently vacant. Discover our latest couture runway drops.
                        </p>
                        <Link 
                          href="/shop" 
                          className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-white/90 transition-all shadow-xl"
                        >
                          <span>Browse Atelier Collection ↗</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userOrders.map((order) => (
                          <div 
                            key={order.id} 
                            className="bg-[#0a0a0a] border border-white/5 hover:border-white/15 rounded-sm p-6 md:p-8 transition-all space-y-6"
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/5">
                              <div>
                                <p className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 mb-1">
                                  Manifest ID
                                </p>
                                <p className="font-mono text-sm font-semibold text-white tracking-wider">
                                  {order.orderId || order.id}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-6">
                                <div>
                                  <p className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 mb-1">
                                    Date
                                  </p>
                                  <p className="text-xs font-mono text-white/70">
                                    {order.date ? new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 mb-1">
                                    Total
                                  </p>
                                  <p className="text-xs font-mono font-semibold text-white">
                                    {formatCurrency(order.total)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 mb-1">
                                    Status
                                  </p>
                                  <span className={`inline-block text-[9px] uppercase font-mono tracking-[0.2em] px-2.5 py-0.5 rounded-full border ${
                                    order.status === 'delivered' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                                    order.status === 'shipped' ? 'border-sky-500/30 text-sky-400 bg-sky-500/5' :
                                    'border-white/20 text-white/80 bg-white/5'
                                  }`}>
                                    {order.status || 'Processing'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex -space-x-3 overflow-hidden py-1">
                                {order.items?.slice(0, 4).map((item: any, i: number) => (
                                  <div key={i} className="w-12 h-16 border border-white/10 rounded-sm overflow-hidden bg-white/5 shadow-md flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {order.items?.length > 4 && (
                                  <div className="w-12 h-16 border border-white/10 rounded-sm bg-white/10 flex items-center justify-center text-[10px] font-mono text-white/70">
                                    +{order.items.length - 4}
                                  </div>
                                )}
                              </div>

                              <Link 
                                href={`/track-order?id=${order.orderId || order.id}&email=${order.email || user.email}`}
                                className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 hover:bg-white/[0.04] text-white px-6 py-2.5 rounded-full text-[10px] uppercase font-mono tracking-[0.2em] transition-all"
                              >
                                <span>Track Consignment ↗</span>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="pb-4 border-b border-white/5">
                      <h2 className="font-serif text-2xl tracking-tight text-white">Patron Credentials</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-sm">
                        <p className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 mb-2">
                          [01] Full Name
                        </p>
                        <p className="text-base font-serif text-white">
                          {user.displayName || 'Patron Member'}
                        </p>
                      </div>

                      <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-sm">
                        <p className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 mb-2">
                          [02] Patron Since
                        </p>
                        <p className="text-base font-serif text-white">
                          {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Active Member'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-sm">
                      <p className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 mb-2">
                        [03] Registered Email
                      </p>
                      <p className="text-sm font-mono text-white/80">{user.email}</p>
                    </div>

                    <div className="p-8 border border-white/10 bg-white/[0.02] rounded-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] blur-2xl pointer-events-none" />
                      <div className="flex items-start gap-4">
                        <ShieldCheck className="w-6 h-6 text-white/80 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] uppercase font-mono tracking-[0.25em] text-white font-semibold mb-2">
                            Elite Atelier Tier
                          </h4>
                          <p className="text-xs text-white/50 leading-relaxed font-sans">
                            As a verified patron of WEARITION, your account is pre-registered for priority concierge delivery, exclusive preview of seasonal drops, and custom tailoring consultations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        </div>
      </div>
    );
  }

  // GUEST / AUTHENTICATION VIEW
  const renderAuthView = () => {
    switch (view) {
      case 'login':
        return (
          <motion.form
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
            onSubmit={handleLogin}
          >
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-3.5 pl-10 pr-4 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                  placeholder="patron@wearition.store"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40">
                  Password
                </label>
                <button 
                  type="button" 
                  onClick={() => setView('forgot')}
                  className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-3.5 pl-10 pr-4 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAction}
              className="w-full mt-4 bg-white text-black py-4 rounded-full text-[10px] uppercase font-mono tracking-[0.25em] font-semibold hover:bg-white/90 transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoadingAction ? 'Verifying...' : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </motion.form>
        );

      case 'signup':
        return (
          <motion.form
            key="signup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
            onSubmit={handleInitiateSignup}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-3.5 px-3.5 text-white text-xs focus:border-white focus:outline-none transition-colors"
                  placeholder="Ahmed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-3.5 px-3.5 text-white text-xs focus:border-white focus:outline-none transition-colors"
                  placeholder="Khan"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-3.5 pl-10 pr-4 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                  placeholder="patron@wearition.store"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-3.5 pl-10 pr-4 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAction}
              className="w-full mt-4 bg-white text-black py-4 rounded-full text-[10px] uppercase font-mono tracking-[0.25em] font-semibold hover:bg-white/90 transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoadingAction ? 'Preparing Access...' : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </motion.form>
        );

      case 'verify':
        return (
          <motion.form
            key="verify"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
            onSubmit={handleVerifySignup}
          >
            <div>
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-serif text-2xl text-white mb-2">Verify Identity</h2>
              <p className="text-white/40 text-xs font-sans">
                A 6-digit code has been dispatched to <br/>
                <span className="text-white font-mono">{email}</span>
              </p>
            </div>

            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-4 text-center text-3xl font-mono text-white tracking-[0.4em] focus:border-white focus:outline-none transition-colors"
              placeholder="000000"
            />

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoadingAction || otp.length < 6}
                className="w-full bg-white text-black py-4 rounded-full text-[10px] uppercase font-mono tracking-[0.25em] font-semibold hover:bg-white/90 transition-all shadow-xl disabled:opacity-30"
              >
                {isLoadingAction ? 'Verifying...' : 'Complete Registration'}
              </button>
              <button 
                type="button"
                onClick={() => setView('signup')}
                className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 hover:text-white transition-colors"
              >
                Change Email Address
              </button>
            </div>
          </motion.form>
        );

      case 'forgot':
        return (
          <motion.form
            key="forgot"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            onSubmit={handleInitiateReset}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-serif text-2xl text-white mb-2">Reset Access</h2>
              <p className="text-white/40 text-xs font-sans">
                Enter your registered email to receive a secure recovery code.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-3.5 pl-10 pr-4 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                  placeholder="patron@wearition.store"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoadingAction}
                className="w-full bg-white text-black py-4 rounded-full text-[10px] uppercase font-mono tracking-[0.25em] font-semibold hover:bg-white/90 transition-all shadow-xl disabled:opacity-50"
              >
                {isLoadingAction ? 'Sending Code...' : 'Dispatch Reset Code'}
              </button>
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => setView('login')}
                  className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          </motion.form>
        );

      case 'reset':
        return (
          <motion.form
            key="reset"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
            onSubmit={handleCompleteReset}
          >
            <div className="text-center">
              <h2 className="font-serif text-2xl text-white mb-2">Set New Password</h2>
              <p className="text-white/40 text-xs font-sans">
                Verify the 6-digit code sent to your email and define your new credential.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40 text-center block">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-3.5 text-center text-2xl font-mono text-white tracking-[0.4em] focus:border-white focus:outline-none transition-colors"
                  placeholder="000000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-mono tracking-[0.2em] text-white/40">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-3.5 pl-10 pr-4 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAction || otp.length < 6}
              className="w-full bg-white text-black py-4 rounded-full text-[10px] uppercase font-mono tracking-[0.25em] font-semibold hover:bg-white/90 transition-all shadow-xl disabled:opacity-30"
            >
              {isLoadingAction ? 'Updating...' : 'Update Password'}
            </button>
          </motion.form>
        );
    }
  };

  return (
    <div className="w-full min-h-screen pt-32 md:pt-40 px-6 pb-24 bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0a0a0a] border border-white/10 rounded-sm p-8 md:p-10 shadow-2xl">
          
          <div className="text-center mb-8">
            <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-white/40 mb-2">
              [01] • ATELIER PATRON PORTAL
            </p>
            <h1 className="font-serif text-3xl tracking-tight text-white uppercase">
              WEARITION
            </h1>
          </div>

          {(view === 'login' || view === 'signup') && (
            <div className="flex bg-white/[0.03] p-1 rounded-full mb-8 border border-white/5">
              <button
                type="button"
                onClick={() => { setView('login'); setError(null); }}
                className={`flex-1 py-2.5 rounded-full text-[9px] uppercase font-mono tracking-[0.2em] font-semibold transition-all ${
                  view === 'login' 
                    ? 'bg-white text-black shadow-md' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setView('signup'); setError(null); }}
                className={`flex-1 py-2.5 rounded-full text-[9px] uppercase font-mono tracking-[0.2em] font-semibold transition-all ${
                  view === 'signup' 
                    ? 'bg-white text-black shadow-md' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase tracking-widest text-center rounded-sm"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {renderAuthView()}
          </AnimatePresence>

          {(view === 'login' || view === 'signup') && (
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="relative flex items-center justify-center mb-6">
                <span className="bg-[#0a0a0a] px-3 text-[8px] uppercase font-mono tracking-[0.3em] text-white/30 relative z-10">
                  Instant Authentication
                </span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoadingAction}
                className="w-full py-3.5 bg-white/[0.03] border border-white/10 hover:border-white/25 hover:bg-white/[0.06] text-white text-[10px] uppercase font-mono tracking-[0.2em] font-semibold rounded-full transition-all flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/shop" 
            className="text-[10px] uppercase font-mono tracking-[0.25em] text-white/40 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <span>Return to Collections</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

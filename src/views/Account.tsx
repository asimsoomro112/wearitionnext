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
  KeyRound
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import { generateOTP, saveOTP, verifyOTP } from '@/lib/otpService';
import { sendVerificationOTPEmail, sendPasswordResetOTPEmail } from '@/lib/emailService';

type AuthView = 'login' | 'signup' | 'verify' | 'forgot' | 'reset';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
      <div className="w-full min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full"
        />
      </div>
    );
  }

  if (user) {
    return (
      <div className="w-full min-h-screen pt-32 md:pt-40 px-6 pb-32 bg-background">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-16"
          >
            {/* Sidebar / Profile Summary */}
            <aside className="w-full lg:w-1/3">
              <div className="sticky top-40 bg-foreground/[0.03] p-10 rounded-2xl border border-foreground/5 shadow-2xl">
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-8 mx-auto lg:mx-0 border border-accent/30 shadow-inner">
                  <UserCircle className="w-10 h-10 text-accent" />
                </div>
                <h1 className="font-serif text-3xl text-foreground mb-2 text-center lg:text-left">Welcome back</h1>
                <p className="text-foreground/60 text-sm font-sans mb-10 text-center lg:text-left break-all">{user.email}</p>
                
                <nav className="flex flex-col gap-3">
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-300 ${activeTab === 'orders' ? 'bg-foreground text-background font-bold shadow-lg' : 'text-foreground/60 hover:bg-foreground/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <History className="w-4 h-4" />
                      <span className="uppercase text-[10px] tracking-widest">Order History</span>
                    </div>
                    <span className="text-[10px] opacity-40">{userOrders.length}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-300 ${activeTab === 'profile' ? 'bg-foreground text-background font-bold shadow-lg' : 'text-foreground/60 hover:bg-foreground/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-4 h-4" />
                      <span className="uppercase text-[10px] tracking-widest">Personal Info</span>
                    </div>
                  </button>
                  {isAdmin && (
                    <Link 
                      href="/admin"
                      className="flex items-center justify-between px-6 py-4 rounded-xl text-accent border border-accent/20 hover:bg-accent/5 mt-4 text-center transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="uppercase text-[10px] tracking-widest">Admin Dashboard</span>
                      </div>
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-between px-6 py-4 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 mt-8 border border-red-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      <span className="uppercase text-[10px] tracking-widest">Sign Out</span>
                    </div>
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="w-full lg:w-2/3">
              <AnimatePresence mode="wait">
                {activeTab === 'orders' ? (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="font-serif text-3xl uppercase tracking-wider">My Orders</h2>
                      <Link href="/shop" className="text-[10px] uppercase tracking-widest text-accent hover:underline flex items-center gap-2">
                        Continue Shopping <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {isOrdersLoading ? (
                      <div className="flex flex-col items-center py-20 gap-4">
                        <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                        <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">Fetching your orders...</p>
                      </div>
                    ) : userOrders.length === 0 ? (
                      <div className="text-center py-32 border border-foreground/5 rounded-3xl bg-foreground/[0.01] shadow-inner">
                        <ShoppingBag className="w-16 h-16 text-foreground/10 mx-auto mb-6" />
                        <h3 className="font-serif text-2xl mb-4">No orders yet</h3>
                        <p className="text-foreground/40 text-sm font-sans mb-10 max-w-xs mx-auto leading-relaxed">Your journey with WEARITION begins with your first selection.</p>
                        <Link href="/shop" className="px-10 py-4 bg-foreground text-background text-xs uppercase tracking-widest hover:bg-accent transition-all inline-block rounded-full shadow-xl">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {userOrders.map((order) => (
                          <div key={order.id} className="bg-foreground/[0.03] border border-foreground/5 p-8 rounded-2xl hover:border-accent/20 transition-all group">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8 pb-6 border-b border-foreground/5">
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Order ID</p>
                                <p className="font-sans text-lg font-bold">{order.orderId}</p>
                              </div>
                              <div className="flex gap-12">
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Date</p>
                                  <p className="text-sm font-medium">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Total</p>
                                  <p className="text-sm font-bold text-accent">{formatCurrency(order.total)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Status</p>
                                  <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-bold shadow-sm ${
                                    order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                    order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                    'bg-accent/10 text-accent border border-accent/20'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="flex -space-x-3 overflow-hidden">
                                {order.items?.slice(0, 4).map((item: any, i: number) => (
                                  <div key={i} className="w-12 h-16 border-2 border-background rounded-lg overflow-hidden bg-foreground/5 shadow-md">
                                    <img src={item.image} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                  </div>
                                ))}
                                {order.items?.length > 4 && (
                                  <div className="w-12 h-16 border-2 border-background rounded-lg bg-foreground/10 flex items-center justify-center text-[10px] font-bold shadow-md">
                                    +{order.items.length - 4}
                                  </div>
                                )}
                              </div>
                              <Link 
                                href={`/track-order?id=${order.orderId}&email=${order.email}`}
                                className="px-8 py-3 bg-foreground text-background text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-all rounded-lg shadow-lg"
                              >
                                Track Order
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-xl"
                  >
                    <h2 className="font-serif text-3xl uppercase tracking-wider mb-12">Personal Information</h2>
                    
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="bg-foreground/[0.02] p-6 rounded-xl border border-foreground/5">
                          <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Display Name</p>
                          <p className="text-lg font-serif">{user.displayName || 'Guest Member'}</p>
                        </div>
                        <div className="bg-foreground/[0.02] p-6 rounded-xl border border-foreground/5">
                          <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Member Since</p>
                          <p className="text-lg font-serif">{new Date(user.metadata.creationTime || '').toLocaleDateString('en-US', { year: 'numeric' })}</p>
                        </div>
                      </div>
                      
                      <div className="bg-foreground/[0.02] p-6 rounded-xl border border-foreground/5">
                        <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Email Address</p>
                        <p className="text-lg font-sans italic">{user.email}</p>
                      </div>

                      <div className="p-10 border border-accent/20 bg-accent/5 rounded-2xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                        <ShieldCheck className="w-10 h-10 text-accent mb-6" />
                        <h4 className="uppercase text-xs tracking-[0.2em] text-accent font-bold mb-4">Elite Membership</h4>
                        <p className="text-sm text-foreground/70 leading-relaxed font-sans italic relative z-10">
                          As a registered member of WEARITION, you receive exclusive access to early drops, priority customer support, and tailored luxury styling.
                        </p>
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

  const renderAuthView = () => {
    switch (view) {
      case 'login':
        return (
          <motion.form
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-5"
            onSubmit={handleLogin}
          >
            <div className="group space-y-2">
              <label className="uppercase text-[9px] tracking-[0.2em] text-foreground/40 font-bold ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-foreground/20 text-sm"
                  placeholder="name@luxury.com"
                />
              </div>
            </div>

            <div className="group space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="uppercase text-[9px] tracking-[0.2em] text-foreground/40 font-bold">Password</label>
                <button 
                  type="button" 
                  onClick={() => setView('forgot')}
                  className="text-[9px] uppercase tracking-widest text-accent hover:text-foreground transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-foreground/20 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAction}
              className="mt-4 bg-foreground text-background py-4 rounded-xl uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-all w-full shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {isLoadingAction ? 'Verifying...' : (
                <>
                  Sign In <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
            className="flex flex-col gap-5"
            onSubmit={handleInitiateSignup}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="group space-y-2">
                <label className="uppercase text-[9px] tracking-[0.2em] text-foreground/40 font-bold ml-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-4 px-5 text-foreground focus:outline-none focus:border-accent transition-all text-sm"
                />
              </div>
              <div className="group space-y-2">
                <label className="uppercase text-[9px] tracking-[0.2em] text-foreground/40 font-bold ml-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-4 px-5 text-foreground focus:outline-none focus:border-accent transition-all text-sm"
                />
              </div>
            </div>

            <div className="group space-y-2">
              <label className="uppercase text-[9px] tracking-[0.2em] text-foreground/40 font-bold ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-accent transition-all text-sm"
                  placeholder="name@luxury.com"
                />
              </div>
            </div>

            <div className="group space-y-2">
              <label className="uppercase text-[9px] tracking-[0.2em] text-foreground/40 font-bold ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-accent transition-all text-sm"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAction}
              className="mt-4 bg-foreground text-background py-4 rounded-xl uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-all w-full shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {isLoadingAction ? 'Preparing Access...' : (
                <>
                  Create Account <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        );

      case 'verify':
        return (
          <motion.form
            key="verify"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-8 text-center"
            onSubmit={handleVerifySignup}
          >
            <div>
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-serif text-3xl mb-4">Verify Identity</h2>
              <p className="text-foreground/40 text-sm leading-relaxed px-4">
                We've sent a unique 6-digit code to <br/>
                <span className="text-accent font-medium">{email}</span>
              </p>
            </div>

            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="bg-foreground/[0.05] text-accent text-4xl text-center tracking-[0.5em] py-6 border border-foreground/10 rounded-2xl focus:border-accent focus:ring-1 focus:ring-accent/20 focus:outline-none transition-all font-mono"
              placeholder="000000"
            />

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoadingAction || otp.length < 6}
                className="bg-foreground text-background py-5 rounded-xl uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-all w-full shadow-xl disabled:opacity-30"
              >
                {isLoadingAction ? 'Verifying...' : 'Complete Registration'}
              </button>
              <button 
                type="button"
                onClick={() => setView('signup')}
                className="text-[9px] uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
              >
                Change Email
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
            className="flex flex-col gap-8"
            onSubmit={handleInitiateReset}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <KeyRound className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-serif text-3xl mb-4">Reset Access</h2>
              <p className="text-foreground/40 text-sm leading-relaxed">
                Enter your email address and we'll send <br/>
                you a secure reset code.
              </p>
            </div>

            <div className="group space-y-2">
              <label className="uppercase text-[9px] tracking-[0.2em] text-foreground/40 font-bold ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-accent transition-all text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoadingAction}
                className="bg-foreground text-background py-5 rounded-xl uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-all w-full shadow-xl"
              >
                {isLoadingAction ? 'Sending Code...' : 'Send Reset Code'}
              </button>
              <button 
                type="button"
                onClick={() => setView('login')}
                className="text-[9px] uppercase tracking-widest text-foreground/40 hover:text-foreground text-center transition-colors"
              >
                Return to Login
              </button>
            </div>
          </motion.form>
        );

      case 'reset':
        return (
          <motion.form
            key="reset"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-8"
            onSubmit={handleCompleteReset}
          >
            <div className="text-center">
              <h2 className="font-serif text-3xl mb-4">Set New Password</h2>
              <p className="text-foreground/40 text-sm leading-relaxed">
                Verify the code sent to your email <br/>
                and choose a new secure password.
              </p>
            </div>

            <div className="space-y-6">
              <div className="group space-y-2">
                <label className="uppercase text-[9px] tracking-[0.2em] text-foreground/40 font-bold text-center block">6-Digit Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-foreground/[0.05] text-accent text-3xl text-center tracking-[0.4em] py-5 border border-foreground/10 rounded-xl focus:border-accent focus:outline-none transition-all font-mono"
                  placeholder="000000"
                />
              </div>

              <div className="group space-y-2">
                <label className="uppercase text-[9px] tracking-[0.2em] text-foreground/40 font-bold ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-accent transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAction || otp.length < 6}
              className="bg-foreground text-background py-5 rounded-xl uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-all w-full shadow-xl disabled:opacity-30"
            >
              {isLoadingAction ? 'Updating...' : 'Update Password'}
            </button>
          </motion.form>
        );
    }
  };

  return (
    <div className="w-full min-h-screen pt-32 md:pt-40 px-6 pb-20 bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-accent/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/5 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-foreground/[0.03] border border-foreground/10 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl mb-3 uppercase tracking-tighter">Wearition</h1>
          </div>

          {view === 'login' || view === 'signup' ? (
            <div className="flex bg-foreground/5 p-1.5 rounded-2xl mb-10 border border-foreground/5 shadow-inner">
              <button
                type="button"
                onClick={() => { setView('login'); setError(null); }}
                className={`uppercase text-[9px] tracking-[0.3em] font-bold py-3.5 rounded-xl transition-all flex-1 text-center ${
                  view === 'login' ? 'bg-background text-foreground shadow-lg' : 'text-foreground/30 hover:text-foreground/50'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setView('signup'); setError(null); }}
                className={`uppercase text-[9px] tracking-[0.3em] font-bold py-3.5 rounded-xl transition-all flex-1 text-center ${
                  view === 'signup' ? 'bg-background text-foreground shadow-lg' : 'text-foreground/30 hover:text-foreground/50'
                }`}
              >
                Register
              </button>
            </div>
          ) : null}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] text-center uppercase tracking-widest font-bold rounded-xl"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {renderAuthView()}
          </AnimatePresence>

          {(view === 'login' || view === 'signup') && (
            <div className="mt-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-foreground/10 flex-1" />
                <span className="text-[8px] uppercase tracking-[0.4em] text-foreground/20 font-bold">Elite Authentication</span>
                <div className="h-px bg-foreground/10 flex-1" />
              </div>
              <button 
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoadingAction}
                className="w-full py-4 bg-background border border-foreground/10 text-foreground uppercase text-[10px] tracking-[0.2em] font-bold rounded-xl hover:bg-foreground hover:text-background transition-all flex items-center justify-center gap-4 shadow-sm active:scale-[0.98] group"
              >
                <div className="bg-white p-1 rounded-md shadow-sm group-hover:bg-transparent group-hover:text-inherit transition-colors">
                  <GoogleIcon />
                </div>
                Continue with Google
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/shop" className="text-[10px] uppercase tracking-[0.3em] text-foreground/30 hover:text-accent transition-colors flex items-center justify-center gap-2">
            Return to Collection <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

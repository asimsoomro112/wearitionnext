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
import { toast } from 'sonner';
import { generateOTP, saveOTP, verifyOTP } from '@/lib/otpService';
import { sendVerificationOTPEmail, sendPasswordResetOTPEmail } from '@/lib/emailService';

type AuthView = 'login' | 'signup' | 'verify' | 'forgot' | 'reset';

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
  const [timer, setTimer] = useState(0);
  
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
    return <div className="w-full min-h-screen flex items-center justify-center bg-background text-foreground uppercase tracking-widest text-xs">Loading...</div>;
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
              <div className="sticky top-40 bg-foreground/[0.03] p-10 rounded-2xl border border-white/5">
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-8 mx-auto lg:mx-0">
                  <span className="text-accent text-3xl font-serif">{user.email?.[0].toUpperCase()}</span>
                </div>
                <h1 className="font-serif text-3xl text-foreground mb-2 text-center lg:text-left">Welcome,</h1>
                <p className="text-foreground/60 text-sm font-sans mb-10 text-center lg:text-left break-all">{user.email}</p>
                
                <nav className="flex flex-col gap-4">
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center justify-between px-6 py-4 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-foreground text-background font-bold' : 'text-foreground/60 hover:bg-white/5'}`}
                  >
                    <span className="uppercase text-[10px] tracking-widest">Order History</span>
                    <span className="text-[10px] opacity-40">{userOrders.length}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center justify-between px-6 py-4 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-foreground text-background font-bold' : 'text-foreground/60 hover:bg-white/5'}`}
                  >
                    <span className="uppercase text-[10px] tracking-widest">Personal Info</span>
                  </button>
                  {isAdmin && (
                    <Link 
                      href="/admin"
                      className="flex items-center justify-between px-6 py-4 rounded-xl text-accent border border-accent/20 hover:bg-accent/5 mt-4 text-center"
                    >
                      <span className="uppercase text-[10px] tracking-widest">Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-between px-6 py-4 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 mt-8 border border-red-500/10"
                  >
                    <span className="uppercase text-[10px] tracking-widest">Sign Out</span>
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
                      <Link href="/shop" className="text-[10px] uppercase tracking-widest text-accent hover:underline">Continue Shopping</Link>
                    </div>

                    {isOrdersLoading ? (
                      <div className="flex flex-col items-center py-20 gap-4">
                        <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                        <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">Fetching your orders...</p>
                      </div>
                    ) : userOrders.length === 0 ? (
                      <div className="text-center py-32 border border-white/5 rounded-3xl bg-foreground/[0.01]">
                        <p className="font-serif text-5xl text-foreground/10 mb-6">◇</p>
                        <h3 className="font-serif text-2xl mb-4">No orders yet</h3>
                        <p className="text-foreground/40 text-sm font-sans mb-10 max-w-xs mx-auto">Your journey with WEARITION begins with your first selection.</p>
                        <Link href="/shop" className="px-10 py-4 bg-foreground text-background text-xs uppercase tracking-widest hover:bg-accent transition-colors">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {userOrders.map((order) => (
                          <div key={order.id} className="bg-foreground/[0.03] border border-white/5 p-8 rounded-2xl hover:border-white/10 transition-colors">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8 pb-6 border-b border-white/5">
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Order ID</p>
                                <p className="font-sans text-lg font-bold">{order.orderId}</p>
                              </div>
                              <div className="flex gap-12">
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Date</p>
                                  <p className="text-sm">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Total</p>
                                  <p className="text-sm font-bold text-accent">{formatCurrency(order.total)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Status</p>
                                  <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-bold ${
                                    order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                    order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-accent/10 text-accent'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="flex -space-x-3 overflow-hidden">
                                {order.items?.slice(0, 4).map((item: any, i: number) => (
                                  <div key={i} className="w-12 h-16 border-2 border-background rounded-lg overflow-hidden bg-white/5">
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {order.items?.length > 4 && (
                                  <div className="w-12 h-16 border-2 border-background rounded-lg bg-foreground/10 flex items-center justify-center text-[10px] font-bold">
                                    +{order.items.length - 4}
                                  </div>
                                )}
                              </div>
                              <Link 
                                href={`/track-order?id=${order.orderId}&email=${order.email}`}
                                className="px-8 py-3 bg-foreground text-background text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors rounded-lg shadow-lg"
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
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Display Name</p>
                          <p className="text-lg pb-4 border-b border-white/5 font-serif">{user.displayName || 'Guest Member'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Member Since</p>
                          <p className="text-lg pb-4 border-b border-white/5 font-serif">{new Date(user.metadata.creationTime || '').toLocaleDateString('en-US', { year: 'numeric' })}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Email Address</p>
                        <p className="text-lg pb-4 border-b border-white/5 font-sans italic">{user.email}</p>
                      </div>

                      <div className="p-8 border border-accent/20 bg-accent/5 rounded-2xl">
                        <h4 className="uppercase text-[10px] tracking-[0.2em] text-accent font-bold mb-4">Elite Membership</h4>
                        <p className="text-sm text-foreground/70 leading-relaxed font-sans italic">
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-6"
            onSubmit={handleLogin}
          >
            <div className="flex flex-col gap-2">
              <label className="uppercase text-[10px] tracking-widest text-foreground/40 font-bold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-b border-white/10 py-4 text-foreground focus:outline-none focus:border-accent transition-all placeholder:text-foreground/10 text-lg"
                placeholder="your@email.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="uppercase text-[10px] tracking-widest text-foreground/40 font-bold">Password</label>
                <button 
                  type="button" 
                  onClick={() => setView('forgot')}
                  className="text-[9px] uppercase tracking-widest text-accent hover:text-foreground transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-b border-white/10 py-4 text-foreground focus:outline-none focus:border-accent transition-all placeholder:text-foreground/10 text-lg"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingAction}
              className="mt-8 bg-foreground text-background py-5 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-all w-full shadow-2xl active:scale-[0.98]"
            >
              {isLoadingAction ? 'Accessing...' : 'Sign In'}
            </button>
          </motion.form>
        );

      case 'signup':
        return (
          <motion.form
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
            onSubmit={handleInitiateSignup}
          >
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="uppercase text-[10px] tracking-widest text-foreground/40 font-bold">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-transparent border-b border-white/10 py-4 text-foreground focus:outline-none focus:border-accent transition-all"
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="uppercase text-[10px] tracking-widest text-foreground/40 font-bold">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-transparent border-b border-white/10 py-4 text-foreground focus:outline-none focus:border-accent transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="uppercase text-[10px] tracking-widest text-foreground/40 font-bold">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-b border-white/10 py-4 text-foreground focus:outline-none focus:border-accent transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="uppercase text-[10px] tracking-widest text-foreground/40 font-bold">Choose Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-b border-white/10 py-4 text-foreground focus:outline-none focus:border-accent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingAction}
              className="mt-8 bg-foreground text-background py-5 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-all w-full"
            >
              {isLoadingAction ? 'Sending Code...' : 'Create Account'}
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
              <h2 className="font-serif text-3xl mb-4">Verify Your Email</h2>
              <p className="text-foreground/40 text-sm">We've sent a 6-digit code to <br/><span className="text-foreground font-medium">{email}</span></p>
            </div>

            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="bg-black text-accent text-4xl text-center tracking-[0.5em] py-6 border border-white/10 rounded-xl focus:border-accent focus:outline-none transition-all font-mono"
              placeholder="000000"
            />

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoadingAction || otp.length < 6}
                className="bg-foreground text-background py-5 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-all w-full disabled:opacity-30"
              >
                {isLoadingAction ? 'Verifying...' : 'Complete Registration'}
              </button>
              <button 
                type="button"
                onClick={() => setView('signup')}
                className="text-[9px] uppercase tracking-widest text-foreground/40 hover:text-foreground"
              >
                Change Email / Back
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
            <div>
              <h2 className="font-serif text-3xl mb-4 text-center">Reset Password</h2>
              <p className="text-foreground/40 text-sm text-center">Enter your email and we'll send you <br/>a secure reset code.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="uppercase text-[10px] tracking-widest text-foreground/40 font-bold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-b border-white/10 py-4 text-foreground focus:outline-none focus:border-accent transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoadingAction}
                className="bg-foreground text-background py-5 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-all w-full"
              >
                {isLoadingAction ? 'Sending Code...' : 'Send Reset Code'}
              </button>
              <button 
                type="button"
                onClick={() => setView('login')}
                className="text-[9px] uppercase tracking-widest text-foreground/40 hover:text-foreground text-center"
              >
                Back to Login
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
              <p className="text-foreground/40 text-sm">Enter the code sent to your email <br/>and choose a new secure password.</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="uppercase text-[10px] tracking-widest text-foreground/40 font-bold text-center">6-Digit Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="bg-black text-accent text-3xl text-center tracking-[0.4em] py-4 border border-white/10 rounded-xl focus:border-accent focus:outline-none transition-all font-mono"
                  placeholder="000000"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="uppercase text-[10px] tracking-widest text-foreground/40 font-bold">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-transparent border-b border-white/10 py-4 text-foreground focus:outline-none focus:border-accent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAction || otp.length < 6}
              className="bg-foreground text-background py-5 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-accent transition-all w-full disabled:opacity-30"
            >
              {isLoadingAction ? 'Updating...' : 'Update Password'}
            </button>
          </motion.form>
        );
    }
  };

  return (
    <div className="w-full min-h-[80vh] pt-32 md:pt-40 px-6 pb-20 bg-background flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.03),transparent_70%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        {view === 'login' || view === 'signup' ? (
          <div className="flex gap-12 mb-12 border-b border-white/10">
            <button
              type="button"
              onClick={() => { setView('login'); setError(null); }}
              className={`uppercase text-[10px] tracking-[0.4em] font-bold pb-6 transition-all relative flex-1 text-center ${
                view === 'login' ? 'text-foreground' : 'text-foreground/20 hover:text-foreground/40'
              }`}
            >
              Sign In
              {view === 'login' && (
                <motion.div
                  layoutId="auth-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => { setView('signup'); setError(null); }}
              className={`uppercase text-[10px] tracking-[0.4em] font-bold pb-6 transition-all relative flex-1 text-center ${
                view === 'signup' ? 'text-foreground' : 'text-foreground/20 hover:text-foreground/40'
              }`}
            >
              Register
              {view === 'signup' && (
                <motion.div
                  layoutId="auth-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          </div>
        ) : null}

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] text-center uppercase tracking-widest font-bold"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {renderAuthView()}
        </AnimatePresence>

        {(view === 'login' || view === 'signup') && (
          <div className="mt-16 text-center">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-white/5 flex-1" />
              <span className="text-[9px] uppercase tracking-widest text-foreground/20">Elite Access</span>
              <div className="h-px bg-white/5 flex-1" />
            </div>
            <button 
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoadingAction}
              className="w-full py-4 border border-white/10 text-foreground uppercase text-[9px] tracking-[0.3em] hover:bg-foreground hover:text-background transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              Continue with Google
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

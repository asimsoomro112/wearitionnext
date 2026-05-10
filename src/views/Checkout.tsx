"use client";
import { useCartStore, getCartSubtotal } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import { getOptimizedImage } from '../lib/images';
import { sendOrderConfirmationEmail } from '@/lib/emailService';
import { useOrderTrackingStore } from '../store/orderTrackingStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '../components/layout/SEO';
import { doc, setDoc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LogIn, User, ShoppingBag, ArrowRight } from 'lucide-react';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
}

export function Checkout() {
  const { items, clearCart } = useCartStore();
  const subtotal = getCartSubtotal(items);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [email, setEmail] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [shipping, setShipping] = useState<ShippingAddress>({
    firstName: '', lastName: '', address: '', city: '', zip: '', phone: ''
  });
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [isEmailRegistered, setIsEmailRegistered] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const addOrder = useOrderTrackingStore(state => state.addOrder);
  const { user } = useAuthStore();

  // Check if email is registered
  useEffect(() => {
    if (user || !email || !email.includes('@') || !email.includes('.')) {
      setIsEmailRegistered(false);
      return;
    }

    const checkEmail = async () => {
      setIsCheckingEmail(true);
      try {
        // We query by email field in our users collection
        const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()), limit(1));
        const snap = await getDocs(q);
        setIsEmailRegistered(!snap.empty);
      } catch (e) {
        // If rules block us, we just don't show the warning
        console.warn("Email check skipped:", e);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timeout = setTimeout(checkEmail, 800);
    return () => clearTimeout(timeout);
  }, [email, user]);

  // Auto-fill and Load saved data
  useEffect(() => {
    async function loadUserData() {
      if (user) {
        setEmail(user.email || '');
        setShowGuestForm(true); // Auto show form for logged in users
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.savedAddress) {
              setShipping(userData.savedAddress);
              if (userData.savedAddress.email) setEmail(userData.savedAddress.email);
            } else if (user.displayName) {
              const parts = user.displayName.split(' ');
              setShipping(prev => ({
                ...prev,
                firstName: parts[0] || '',
                lastName: parts.slice(1).join(' ') || ''
              }));
            }
          }
        } catch (e) {
          console.error("Error loading user data:", e);
        }
      }
    }
    loadUserData();
  }, [user]);

  const [baseShipping, setBaseShipping] = useState(250);
  const [incrementalShipping, setIncrementalShipping] = useState(100);
  const [taxPercent, setTaxPercent] = useState(0);

  useEffect(() => {
    async function fetchStoreSettings() {
      try {
        const docRef = doc(db, 'settings', 'store');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setBaseShipping(data.baseShipping ?? 250);
          setIncrementalShipping(data.incrementalShipping ?? 100);
          setTaxPercent(data.taxPercentage ?? 0);
        }
      } catch (e) {
        console.error("Error fetching checkout settings:", e);
      }
    }
    fetchStoreSettings();
  }, []);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = totalQuantity > 0 ? baseShipping + (totalQuantity - 1) * incrementalShipping : 0;
  const taxAmount = (subtotal * taxPercent) / 100;
  const total = subtotal + taxAmount + shippingCost;

  const handleShippingChange = (field: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email address'); return; }
    if (!shipping.firstName || !shipping.address || !shipping.city) {
      toast.error('Please fill in your shipping address'); return;
    }

    setIsProcessing(true);

    const orderId = 'WR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

    const orderData = {
      orderId,
      email: email.toLowerCase(),
      userId: user?.uid || 'guest',
      status: 'pending' as const,
      date: new Date().toISOString(),
      subtotal,
      tax: taxAmount,
      total,
      items: items.map(i => ({
        id: i.id, 
        title: i.title, 
        price: i.price,
        quantity: i.quantity, 
        size: i.size || null, 
        color: i.color || null, 
        image: i.image || ""
      })),
      paymentMethod,
      shippingAddress: {
        name: `${shipping.firstName} ${shipping.lastName}`,
        address: shipping.address,
        city: shipping.city,
        zip: shipping.zip || "",
        phone: shipping.phone || "",
      },
      shippingDetails: { 
        shippingAmount: shippingCost,
        taxAmount: taxAmount
      }
    };

    try {
      await addOrder(orderData);

      // Save address to user profile if requested
      if (saveAddress && user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          savedAddress: {
            ...shipping,
            email: email.toLowerCase()
          }
        }, { merge: true });
      }

      // Send rich branded confirmation email
      sendOrderConfirmationEmail({
        email: email.toLowerCase(),
        name: shipping.firstName,
        orderId,
        items: items.map(i => ({
          title: i.title, quantity: i.quantity, price: i.price,
          size: i.size, color: i.color, image: i.image
        })),
        subtotal,
        shipping: shippingCost,
        total,
        shippingAddress: {
          name: `${shipping.firstName} ${shipping.lastName}`,
          address: shipping.address,
          city: shipping.city,
        },
      }).catch(() => {});

      toast.success(`Order ${orderId} placed successfully!`);
      clearCart();
      router.push(`/order-success?id=${orderId}`);
    } catch (error: any) {
      console.error('Order placement failed:', error);
      const errorMessage = error.code === 'permission-denied' 
        ? 'Permission denied. Please ensure you are logged in correctly.'
        : error.message || 'Failed to place order. Please check your connection.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="w-full pt-40 px-6 pb-32 bg-background min-h-[80vh] flex flex-col items-center justify-center">
        <p className="font-serif text-5xl text-foreground/10 mb-6">◇</p>
        <h1 className="font-serif text-3xl mb-4">Your Bag is Empty</h1>
        <p className="text-foreground/50 mb-10 font-sans text-sm">Add something beautiful to your bag first.</p>
        <Link href="/shop" className="px-10 py-4 bg-foreground text-background text-xs uppercase tracking-widest hover:bg-accent transition-colors">
          Explore Collection
        </Link>
      </div>
    );
  }

  const inputClass = "w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors text-foreground placeholder-foreground/30 rounded-sm";
  const labelClass = "block text-[10px] uppercase tracking-widest text-foreground/50 mb-2";

  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background">
      <div className="max-w-[1200px] mx-auto">
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <SEO title="Checkout" description="Complete your WEARITION order securely." />
          <h1 className="font-serif text-4xl md:text-5xl text-foreground">Checkout</h1>
          <p className="text-foreground/40 text-sm font-sans mt-2">Secure & confidential</p>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              {!user && !showGuestForm ? (
                <motion.div 
                  key="choice"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-foreground/5 p-12 rounded-2xl border border-white/5 text-center"
                >
                  <User className="w-12 h-12 text-accent mx-auto mb-6 opacity-50" />
                  <h2 className="font-serif text-2xl mb-4">How would you like to proceed?</h2>
                  <p className="text-foreground/40 text-sm mb-10 max-w-sm mx-auto">Sign in to track your orders and use saved addresses, or proceed as a guest.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/account" className="flex-1 max-w-[240px] bg-foreground text-background py-4 px-8 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In / Sign Up
                    </Link>
                    <button 
                      onClick={() => setShowGuestForm(true)}
                      className="flex-1 max-w-[240px] border border-white/10 text-foreground py-4 px-8 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                      Checkout as Guest
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <form onSubmit={handleCheckout} className="space-y-6">
                    {/* Contact Info */}
                    <section className="bg-foreground/5 p-8 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xs uppercase tracking-widest font-bold text-foreground">Contact Information</h2>
                        {!user && (
                          <button onClick={() => setShowGuestForm(false)} className="text-[10px] uppercase tracking-widest text-accent hover:underline">Change Method</button>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>Email Address *</label>
                          <input value={email} onChange={e => setEmail(e.target.value)} required type="email" className={inputClass} placeholder="your@email.com" />
                          
                          <AnimatePresence>
                            {isEmailRegistered && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 p-3 bg-accent/10 border border-accent/20 rounded-lg flex items-center gap-3 overflow-hidden"
                              >
                                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                <div className="flex-1">
                                  <p className="text-[11px] text-accent font-bold uppercase tracking-widest">Account Registered</p>
                                  <p className="text-[10px] text-foreground/60 leading-relaxed">This email is already registered. <Link href="/account" className="text-foreground font-bold hover:underline">Sign in</Link> for a faster checkout.</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div>
                          <label className={labelClass}>Phone Number</label>
                          <input value={shipping.phone} onChange={handleShippingChange('phone')} type="tel" className={inputClass} placeholder="+92 300 0000000" />
                        </div>
                      </div>
                    </section>

                    {/* Shipping Address */}
                    <section className="bg-foreground/5 p-8 rounded-xl border border-white/5">
                      <h2 className="text-xs uppercase tracking-widest mb-6 font-bold text-foreground">Shipping Address</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>First Name *</label>
                          <input value={shipping.firstName} onChange={handleShippingChange('firstName')} required type="text" className={inputClass} placeholder="Muhammad" />
                        </div>
                        <div>
                          <label className={labelClass}>Last Name *</label>
                          <input value={shipping.lastName} onChange={handleShippingChange('lastName')} required type="text" className={inputClass} placeholder="Ali" />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>Street Address *</label>
                          <input value={shipping.address} onChange={handleShippingChange('address')} required type="text" className={inputClass} placeholder="123 Street, Block B" />
                        </div>
                        <div>
                          <label className={labelClass}>City *</label>
                          <input value={shipping.city} onChange={handleShippingChange('city')} required type="text" className={inputClass} placeholder="Karachi" />
                        </div>
                        <div>
                          <label className={labelClass}>Postal Code</label>
                          <input value={shipping.zip} onChange={handleShippingChange('zip')} type="text" className={inputClass} placeholder="75500" />
                        </div>
                        
                        {user && (
                          <div className="md:col-span-2 flex items-center gap-3 mt-2">
                            <input 
                              type="checkbox" 
                              id="saveAddress" 
                              checked={saveAddress} 
                              onChange={(e) => setSaveAddress(e.target.checked)}
                              className="w-4 h-4 accent-accent"
                            />
                            <label htmlFor="saveAddress" className="text-xs text-foreground/60 cursor-pointer">Save this address for future orders</label>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Payment */}
                    <section className="bg-foreground/5 p-8 rounded-xl border border-white/5">
                      <h2 className="text-xs uppercase tracking-widest mb-6 font-bold text-foreground">Payment Method</h2>
                      <div className="space-y-3">
                        {[
                          { value: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay when your order arrives' },
                          { value: 'easypaisa', label: 'EasyPaisa', desc: 'Mobile wallet payment' },
                          { value: 'jazzcash', label: 'JazzCash', desc: 'Mobile wallet payment' },
                          { value: 'bank', label: 'Bank Transfer', desc: 'Direct bank payment' },
                        ].map(opt => (
                          <label key={opt.value} className={`flex items-center gap-4 cursor-pointer p-4 rounded-lg border transition-all ${paymentMethod === opt.value ? 'border-accent/40 bg-accent/5' : 'border-white/5 hover:border-white/10'}`}>
                            <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="accent-accent" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{opt.label}</p>
                              <p className="text-[10px] text-foreground/40">{opt.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {paymentMethod !== 'cod' && (
                        <div className="mt-4 p-4 border border-accent/10 bg-accent/5 rounded-lg text-xs text-foreground/60 font-sans">
                          Payment instructions will be sent to <b className="text-foreground">{email || 'your email'}</b> after placing your order.
                        </div>
                      )}
                    </section>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-foreground text-background py-5 uppercase text-xs tracking-[0.3em] font-bold hover:bg-accent transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 rounded-full"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        `Place Order · ${formatCurrency(total)}`
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-1/3">
            <div className="sticky top-32 bg-foreground/5 p-8 rounded-xl border border-white/5">
              <h2 className="text-xs uppercase tracking-widest mb-6 font-bold text-foreground">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-foreground/5 relative overflow-hidden rounded-sm">
                      {item.image && <img src={getOptimizedImage(item.image)} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      <span className="absolute -top-1.5 -right-1.5 bg-accent text-black w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-sans uppercase tracking-wide text-foreground">{item.title}</h4>
                      <p className="text-[10px] text-foreground/40 mt-1">{[item.color, item.size && `Size: ${item.size}`].filter(Boolean).join(' · ')}</p>
                    </div>
                    <div className="text-sm font-mono text-foreground">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-3 font-sans text-sm">
                <div className="flex justify-between text-foreground/60">
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Shipping & Handling</span><span>{formatCurrency(shippingCost + taxAmount)}</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-lg text-foreground">
                  <span>Total</span><span className="text-accent">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

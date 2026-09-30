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
  const [taxPercent, setTaxPercent] = useState(4); // Default to 4% as per request

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
        tax: taxAmount,
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
      <div className="w-full pt-40 px-6 pb-32 bg-[#050505] text-white min-h-[85vh] flex flex-col items-center justify-center">
        <p className="font-serif text-5xl text-white/10 mb-6">◇</p>
        <h1 className="font-serif text-3xl md:text-4xl uppercase tracking-tight text-white mb-3">Your Atelier Bag is Empty</h1>
        <p className="text-white/40 mb-8 font-sans text-xs tracking-wide">Acquire exclusive haute couture pieces to proceed with checkout.</p>
        <Link href="/shop" className="px-8 py-3.5 bg-white text-black text-[10px] uppercase tracking-[0.22em] font-semibold hover:bg-white/80 transition-colors rounded-full shadow-xl">
          Discover Collections ↗
        </Link>
      </div>
    );
  }

  const inputClass = "w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white placeholder-white/25 rounded-sm font-sans";
  const labelClass = "block text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 font-medium";

  return (
    <div className="w-full pt-36 md:pt-40 px-6 md:px-12 pb-36 bg-[#050505] text-white min-h-screen">
      <div className="max-w-[1280px] mx-auto">
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <SEO title="Checkout • WEARITION" description="Complete your WEARITION order securely." />
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-white/40 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>SECURE ATELIER ACQUISITION</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white">Checkout</h1>
          <p className="text-white/40 text-xs font-sans mt-2 tracking-wide">Encrypted transactions & certified luxury handling</p>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              {!user && !showGuestForm ? (
                <motion.div 
                  key="choice"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="bg-[#0a0a0a] p-8 md:p-12 rounded-sm border border-white/10 text-center shadow-2xl"
                >
                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-6 text-white/40">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="font-serif text-2xl uppercase tracking-wider text-white mb-3">Choose Acquisition Flow</h2>
                  <p className="text-white/40 text-xs mb-8 max-w-sm mx-auto font-sans leading-relaxed">
                    Sign in to track your order in real-time with saved addresses, or proceed instantly as an atelier guest.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                    <Link href="/account" className="flex-1 max-w-[240px] bg-white text-black py-3.5 px-6 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/80 transition-all flex items-center justify-center gap-2 shadow-xl">
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In / Register
                    </Link>
                    <button 
                      onClick={() => setShowGuestForm(true)}
                      className="flex-1 max-w-[240px] border border-white/15 bg-white/[0.02] text-white py-3.5 px-6 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:border-white/40 hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2"
                    >
                      Checkout as Guest
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <form onSubmit={handleCheckout} className="space-y-6">
                    {/* Contact Info */}
                    <section className="bg-[#0a0a0a] p-6 md:p-8 rounded-sm border border-white/5">
                      <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5">
                        <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white">01. Contact Information</h2>
                        {!user && (
                          <button onClick={() => setShowGuestForm(false)} className="text-[9px] uppercase tracking-widest text-white/50 hover:text-white transition-colors">Change Method</button>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>Email Address *</label>
                          <input value={email} onChange={e => setEmail(e.target.value)} required type="email" className={inputClass} placeholder="patron@wearition.store" />
                          
                          <AnimatePresence>
                            {isEmailRegistered && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 p-3 bg-white/[0.04] border border-white/15 rounded-sm flex items-center gap-3 overflow-hidden"
                              >
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                <div className="flex-1">
                                  <p className="text-[10px] text-white font-bold uppercase tracking-widest">Account Registered</p>
                                  <p className="text-[10px] text-white/60 leading-relaxed font-sans">This email is already registered. <Link href="/account" className="text-white underline hover:text-white/80">Sign in</Link> for faster checkout.</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div>
                          <label className={labelClass}>Contact Phone Number *</label>
                          <input value={shipping.phone} onChange={handleShippingChange('phone')} required type="tel" className={inputClass} placeholder="+92 300 0000000" />
                        </div>
                      </div>
                    </section>

                    {/* Shipping Address */}
                    <section className="bg-[#0a0a0a] p-6 md:p-8 rounded-sm border border-white/5">
                      <h2 className="text-[11px] uppercase tracking-[0.2em] mb-6 pb-3 border-b border-white/5 font-semibold text-white">02. Destination Address</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>First Name *</label>
                          <input value={shipping.firstName} onChange={handleShippingChange('firstName')} required type="text" className={inputClass} placeholder="Given name" />
                        </div>
                        <div>
                          <label className={labelClass}>Last Name *</label>
                          <input value={shipping.lastName} onChange={handleShippingChange('lastName')} required type="text" className={inputClass} placeholder="Family name" />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>Street Address *</label>
                          <input value={shipping.address} onChange={handleShippingChange('address')} required type="text" className={inputClass} placeholder="House / Apartment, Street, Area" />
                        </div>
                        <div>
                          <label className={labelClass}>City *</label>
                          <input value={shipping.city} onChange={handleShippingChange('city')} required type="text" className={inputClass} placeholder="Lahore / Karachi / Islamabad" />
                        </div>
                        <div>
                          <label className={labelClass}>Postal Code</label>
                          <input value={shipping.zip} onChange={handleShippingChange('zip')} type="text" className={inputClass} placeholder="Zip code" />
                        </div>
                        
                        {user && (
                          <div className="md:col-span-2 flex items-center gap-3 mt-2">
                            <input 
                              type="checkbox" 
                              id="saveAddress" 
                              checked={saveAddress} 
                              onChange={(e) => setSaveAddress(e.target.checked)}
                              className="w-4 h-4 accent-white cursor-pointer"
                            />
                            <label htmlFor="saveAddress" className="text-xs text-white/60 cursor-pointer font-sans">Save this address to your patron profile</label>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Payment */}
                    <section className="bg-[#0a0a0a] p-6 md:p-8 rounded-sm border border-white/5">
                      <h2 className="text-[11px] uppercase tracking-[0.2em] mb-6 pb-3 border-b border-white/5 font-semibold text-white">03. Payment Protocol</h2>
                      <div className="space-y-2.5">
                        {[
                          { value: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay courier cash upon signature and inspection at your doorstep.' },
                          { value: 'bank', label: 'Direct Bank Transfer / Wire', desc: 'Secure direct wire to WEARITION Atelier corporate account.' },
                          { value: 'easypaisa', label: 'EasyPaisa Wallet', desc: 'Instant mobile wallet payment.' },
                          { value: 'jazzcash', label: 'JazzCash Wallet', desc: 'Instant mobile wallet payment.' },
                        ].map(opt => (
                          <label key={opt.value} className={`flex items-start gap-4 cursor-pointer p-4 rounded-sm border transition-all ${paymentMethod === opt.value ? 'border-white bg-white/[0.06]' : 'border-white/5 hover:border-white/15 bg-white/[0.01]'}`}>
                            <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="mt-1 accent-white" />
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-white">{opt.label}</p>
                              <p className="text-[10px] text-white/40 font-sans mt-0.5">{opt.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {paymentMethod !== 'cod' && (
                        <div className="mt-4 p-4 border border-white/10 bg-white/[0.03] rounded-sm text-xs text-white/70 font-sans">
                          Payment instructions and account details will be dispatched to <b className="text-white">{email || 'your email'}</b> immediately upon order confirmation.
                        </div>
                      )}
                    </section>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-white text-black py-4.5 uppercase text-[10px] tracking-[0.25em] font-bold hover:bg-white/90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 rounded-full shadow-2xl"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>Authorizing Order...</span>
                        </>
                      ) : (
                        `Confirm Order · ${formatCurrency(total)}`
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-1/3">
            <div className="sticky top-32 bg-[#0a0a0a] p-6 md:p-8 rounded-sm border border-white/5 shadow-2xl">
              <h2 className="text-[11px] uppercase tracking-[0.2em] mb-6 pb-3 border-b border-white/5 font-semibold text-white">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto hide-scrollbar">
                {items.map(item => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 items-center border-b border-white/5 pb-4">
                    <div className="w-16 h-20 bg-neutral-900 relative overflow-hidden rounded-sm border border-white/10 flex-shrink-0">
                      {item.image && <img src={getOptimizedImage(item.image)} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      <span className="absolute -top-1 -right-1 bg-white text-black w-4.5 h-4.5 flex items-center justify-center rounded-full text-[9px] font-mono font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-sans uppercase tracking-wide text-white truncate">{item.title}</h4>
                      <p className="text-[10px] text-white/40 mt-1 font-sans">{[item.color, item.size && `Size: ${item.size}`].filter(Boolean).join(' · ')}</p>
                    </div>
                    <div className="text-xs font-mono text-white whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-5 space-y-3 font-sans text-xs">
                <div className="flex justify-between text-white/60">
                  <span className="uppercase tracking-wider text-[10px]">Subtotal</span>
                  <span className="font-mono text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <div className="flex flex-col">
                    <span className="uppercase tracking-wider text-[10px]">Express Courier</span>
                    <span className="text-[9px] text-white/35 font-normal">Nationwide express transit</span>
                  </div>
                  <span className="font-mono text-white">{formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <div className="flex flex-col">
                    <span className="uppercase tracking-wider text-[10px]">Govt. Tax (4%)</span>
                    <span className="text-[9px] text-white/35 font-normal">Standard tariff</span>
                  </div>
                  <span className="font-mono text-white">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between items-baseline font-medium text-white">
                  <span className="uppercase tracking-[0.2em] text-xs">Total</span>
                  <span className="font-mono text-xl font-medium">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

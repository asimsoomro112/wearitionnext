import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/currency';
import { sendOrderConfirmationEmail } from '../utils/emailService';
import { useOrderTrackingStore } from '../store/orderTrackingStore';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { SEO } from '../components/layout/SEO';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
}

export function Checkout() {
  const { items, subtotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [email, setEmail] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [shipping, setShipping] = useState<ShippingAddress>({
    firstName: '', lastName: '', address: '', city: '', zip: '', phone: ''
  });
  const addOrder = useOrderTrackingStore(state => state.addOrder);
  const { user } = useAuthStore();

  // Auto-fill user data
  useState(() => {
    if (user) {
      setEmail(user.email || '');
      // Try to load saved address from user's meta if we have it
      // For now, we'll just check if displayName exists to split it
      if (user.displayName) {
        const parts = user.displayName.split(' ');
        setShipping(prev => ({
          ...prev,
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || ''
        }));
      }
    }
  });

  const shippingCost = 200;
  const total = subtotal + shippingCost;

  const handleShippingChange = (field: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email address'); return; }
    if (!shipping.firstName || !shipping.address || !shipping.city) {
      toast.error('Please fill in your shipping address'); return;
    }
    if (!user) {
      toast.error('Please sign in to place an order');
      navigate('/account');
      return;
    }

    setIsProcessing(true);

    const orderId = 'WR-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const orderData = {
      orderId,
      email: email.toLowerCase(),
      userId: user.uid,
      status: 'pending' as const,
      date: new Date().toISOString(),
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
      shippingDetails: { shippingAmount: shippingCost }
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
      navigate(`/order-success?id=${orderId}`);
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
        <Link to="/shop" className="px-10 py-4 bg-foreground text-background text-xs uppercase tracking-widest hover:bg-accent transition-colors">
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
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-2/3">
            <form onSubmit={handleCheckout} className="space-y-6">
              {/* Contact Info */}
              <section className="bg-foreground/5 p-8 rounded-xl border border-white/5">
                <h2 className="text-xs uppercase tracking-widest mb-6 font-bold text-foreground">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} required type="email" className={inputClass} placeholder="your@email.com" />
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
                className="w-full bg-foreground text-background py-5 uppercase text-xs tracking-[0.3em] font-bold hover:bg-accent transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
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

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-1/3">
            <div className="sticky top-32 bg-foreground/5 p-8 rounded-xl border border-white/5">
              <h2 className="text-xs uppercase tracking-widest mb-6 font-bold text-foreground">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-foreground/5 relative overflow-hidden rounded-sm">
                      {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
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
                  <span>Shipping</span><span>{formatCurrency(shippingCost)}</span>
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

import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/currency';
import { sendEmailNotification } from '../utils/emailService';
import { useOrderTrackingStore } from '../store/orderTrackingStore';

export function Checkout() {
  const { items, subtotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [email, setEmail] = useState('');
  const addOrder = useOrderTrackingStore(state => state.addOrder);

  const shipping = 20; // 20 USD roughly equivalent, wait we should convert using formatCurrency, or define shipping in original USD and let formatCurrency handle it.
  const total = subtotal + shipping;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      const orderId = 'PK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const orderData = {
        orderId: orderId,
        email: email.toLowerCase(),
        status: 'pending' as const,
        date: new Date().toISOString(),
        total: total,
        items: items.map(i => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          image: i.image
        })),
        paymentMethod: paymentMethod,
        shippingDetails: {
          // You can collect these from the form as well
          shippingAmount: shipping
        }
      };

      try {
        await addOrder(orderData);
        await sendEmailNotification(email, 'confirmation', { orderId: orderId });
        toast.success(`Email sent. Order ${orderId} placed successfully!`);
        
        setIsProcessing(false);
        clearCart();
        navigate(`/track-order?id=${orderId}`);
      } catch (error) {
        console.error('Order placement failed:', error);
        toast.error('Failed to place order. Please try again.');
        setIsProcessing(false);
      }
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-[80vh] flex flex-col items-center justify-center">
        <h1 className="font-serif text-3xl mb-4">Your Bag is Empty</h1>
        <p className="text-foreground/60 mb-8 font-sans">You need to add items to your bag before checking out.</p>
        <Link to="/shop" className="px-8 py-3 bg-foreground text-background text-xs uppercase tracking-widest hover:bg-accent transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-12">
          <h1 className="font-serif text-4xl mb-4 text-foreground">Checkout</h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3">
            <form onSubmit={handleCheckout} className="space-y-8">
              {/* Contact Info */}
              <section className="bg-background-secondary/20 p-8 rounded-xl border border-white/5">
                <h2 className="text-xs uppercase tracking-widest mb-6 font-medium">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-foreground/60 mb-2">Email Address</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30" />
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="bg-background-secondary/20 p-8 rounded-xl border border-white/5">
                <h2 className="text-xs uppercase tracking-widest mb-6 font-medium">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-foreground/60 mb-2">First Name</label>
                    <input required type="text" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-xs text-foreground/60 mb-2">Last Name</label>
                    <input required type="text" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-foreground/60 mb-2">Address</label>
                    <input required type="text" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-xs text-foreground/60 mb-2">City</label>
                    <input required type="text" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-xs text-foreground/60 mb-2">ZIP / Postal Code</label>
                    <input required type="text" className="w-full bg-background border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30" />
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="bg-background-secondary/20 p-8 rounded-xl border border-white/5">
                <h2 className="text-xs uppercase tracking-widest mb-6 font-medium">Payment Options (Pakistan)</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-foreground" />
                    <span className="text-sm">Cash on Delivery (COD)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" value="easypaisa" checked={paymentMethod === 'easypaisa'} onChange={() => setPaymentMethod('easypaisa')} className="accent-foreground" />
                    <span className="text-sm">EasyPaisa Mobile Account</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" value="jazzcash" checked={paymentMethod === 'jazzcash'} onChange={() => setPaymentMethod('jazzcash')} className="accent-foreground" />
                    <span className="text-sm">JazzCash Mobile Account</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="accent-foreground" />
                    <span className="text-sm">Direct Bank Transfer</span>
                  </label>
                </div>
                
                {paymentMethod !== 'cod' && (
                  <div className="mt-6 p-4 border border-white/10 bg-background/50 text-sm font-sans text-foreground/70">
                    <p>Instructions will be sent to your email (<b>{email || 'your-email@example.com'}</b>) after you place the order.</p>
                  </div>
                )}
              </section>

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-foreground text-background py-5 uppercase text-xs tracking-[0.2em] font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="sticky top-32 bg-background-secondary/20 p-8 rounded-xl border border-white/5">
              <h2 className="text-xs uppercase tracking-widest mb-6 font-medium">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-background-secondary relative">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 bg-foreground text-background w-5 h-5 flex items-center justify-center rounded-full text-[10px] z-10">{item.quantity}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-sans uppercase tracking-wide">{item.title}</h4>
                      <p className="text-[10px] text-foreground/60 font-sans mt-1">
                        {item.color} {item.size && `| Size: ${item.size}`}
                      </p>
                    </div>
                    <div className="text-sm font-sans">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4 font-sans text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Shipping</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

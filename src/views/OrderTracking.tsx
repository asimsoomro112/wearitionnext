"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useOrderTrackingStore } from '../store/orderTrackingStore';
import { formatCurrency } from '@/lib/currency';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  ClipboardCheck, 
  MapPin, 
  Phone, 
  MessageSquare, 
  RefreshCcw,
  Clock,
  Box
} from 'lucide-react';
import { SEO } from '../components/layout/SEO';
import { motion } from 'framer-motion';

export function OrderTracking() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const initialEmail = searchParams.get('email') || '';
  
  const [orderId, setOrderId] = useState(initialId);
  const [hasSearched, setHasSearched] = useState(!!initialId);
  const [order, setOrder] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const getOrder = useOrderTrackingStore(state => state.getOrder);

  useEffect(() => {
    const urlId = searchParams.get('id');
    if (urlId) {
      setOrderId(urlId);
      handleTrack(null, urlId);
    }
  }, [searchParams]);

  const handleTrack = async (e: React.FormEvent | null, idOverride?: string) => {
    if (e) e.preventDefault();
    const idToSearch = (idOverride || orderId || '').trim().toUpperCase();
    if (!idToSearch) return;
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      const foundOrder = await getOrder(idToSearch);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error('Order lookup failed:', err);
      setOrder(null);
    } finally {
      setIsSearching(false);
    }
  };

  const statusSteps = [
    { status: 'pending', label: 'Order Placed', desc: 'Your order has been successfully placed.', icon: ClipboardCheck },
    { status: 'processing', label: 'Processing', desc: 'Our atelier is preparing your selection.', icon: Package },
    { status: 'shipped', label: 'Shipped', desc: 'Order handed to courier for delivery.', icon: Truck },
    { status: 'delivered', label: 'Delivered', desc: 'Order has been delivered to your doorstep.', icon: CheckCircle }
  ];

  const getStatusIndex = (status: string) => {
    const orderMap = ['pending', 'processing', 'shipped', 'delivered'];
    return orderMap.indexOf(status);
  };

  if (!hasSearched || !order) {
    return (
      <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-screen">
        <SEO title="Track Order" />
        <div className="max-w-[600px] mx-auto text-center">
          <h1 className="font-serif text-4xl mb-8 uppercase tracking-widest">Track Your Order</h1>
          <p className="text-foreground/50 mb-12 font-sans text-sm">Enter your Order ID to view live updates on your luxury selection.</p>
          
          <form onSubmit={handleTrack} className="space-y-6">
            <input 
              required 
              value={orderId} 
              onChange={(e) => setOrderId(e.target.value)} 
              type="text" 
              placeholder="ORDER ID (E.G. WR-XXXXXX)" 
              className="w-full bg-foreground/[0.03] border border-white/5 px-6 py-4 text-sm focus:outline-none focus:border-accent/30 transition-colors uppercase tracking-widest text-center" 
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="w-full bg-foreground text-background py-5 uppercase text-xs tracking-[0.3em] font-bold hover:bg-accent transition-all duration-300 disabled:opacity-50 rounded-full"
            >
              {isSearching ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {isSearching && (
             <p className="mt-4 text-[10px] text-accent animate-pulse uppercase tracking-widest">Verifying ID: {orderId}</p>
          )}

          {hasSearched && !order && !isSearching && (
            <div className="mt-8 space-y-2">
              <p className="text-red-500 text-xs font-sans">Order "{orderId}" not found.</p>
              <p className="text-foreground/30 text-[10px] uppercase tracking-widest">Please verify the ID from your confirmation email.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentStatusIdx = getStatusIndex(order.status);

  const computedSubtotal = order.subtotal || order.items.reduce((acc: number, item: any) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
  const computedShipping = order.shippingDetails?.shippingAmount || 0;
  // Fallback to order.total only if it's greater than or equal to our computed values, otherwise trust the dynamic computation
  const computedTotal = (order.total && order.total > computedShipping) ? order.total : (computedSubtotal + computedShipping);


  return (
    <div className="w-full pt-32 md:pt-40 px-6 md:px-12 pb-32 bg-background min-h-screen">
      <SEO title={`Order ${order.orderId} Tracking`} />
      
      <div className="max-w-[1200px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">{order.orderId}</h1>
            <p className="text-foreground/40 text-sm font-sans">
              {new Date(order.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="bg-accent/10 border border-accent/20 px-6 py-2 rounded-full">
            <span className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold">
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT: Tracking Timeline */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-foreground/[0.02] border border-white/5 rounded-3xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-12">
                <Box className="w-5 h-5 text-accent" />
                <h2 className="font-serif text-2xl uppercase tracking-wider">Order Tracking</h2>
              </div>

              <div className="relative space-y-12">
                {/* Vertical Line */}
                <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-foreground/5" />

                {statusSteps.map((step, idx) => {
                  const isActive = idx <= currentStatusIdx;
                  const Icon = step.icon;
                  
                  return (
                    <div key={idx} className="flex gap-8 relative">
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isActive ? 'bg-accent text-background shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]' : 'bg-background border border-white/10 text-foreground/20'
                      }`}>
                        {isActive ? <CheckCircle className="w-6 h-6" /> : <span className="text-sm font-bold font-mono">{idx + 1}</span>}
                      </div>
                      
                      <div className="flex-1 pt-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`text-sm font-bold uppercase tracking-widest ${isActive ? 'text-foreground' : 'text-foreground/30'}`}>
                            {step.label}
                          </h3>
                          {isActive && (
                            <span className="text-[10px] text-foreground/40 font-mono">
                              {idx === 0 ? new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-sans leading-relaxed ${isActive ? 'text-foreground/60' : 'text-foreground/20'}`}>
                          {step.status === 'shipped' && order.trackingNumber 
                            ? `Order shipped via ${order.courierName || 'Courier'}. Tracking: ${order.trackingNumber}`
                            : step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom: Items List */}
            <div className="bg-foreground/[0.02] border border-white/5 rounded-3xl p-8 md:p-12">
              <h2 className="font-serif text-2xl uppercase tracking-wider mb-8">Items</h2>
              <div className="space-y-6">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-20 bg-foreground/5 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-sans font-bold text-foreground">{item.title}</h4>
                        <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">
                          {item.quantity} Unit{item.quantity > 1 ? 's' : ''} {item.size && `· Size: ${item.size}`} {item.color && `· ${item.color}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-mono font-bold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Summary & Address */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-foreground/[0.02] border border-white/5 rounded-3xl p-8">
              <h2 className="font-serif text-lg uppercase tracking-widest mb-8">Order Summary</h2>
              <div className="space-y-4 font-sans text-sm">
                <div className="flex justify-between text-foreground/60">
                  <span>Subtotal</span>
                  <span>{formatCurrency(computedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Shipping</span>
                  <span className="text-green-500 font-bold uppercase tracking-widest text-[10px]">
                    {computedShipping > 0 ? formatCurrency(computedShipping) : 'FREE'}
                  </span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-foreground font-bold uppercase text-[10px] tracking-widest">Total</span>
                  <span className="text-2xl font-serif text-foreground">{formatCurrency(computedTotal)}</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-foreground/40">
                  <Clock className="w-3 h-3" />
                  <span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-foreground/[0.02] border border-white/5 rounded-3xl p-8">
              <h2 className="font-serif text-lg uppercase tracking-widest mb-8">Shipping Address</h2>
              <div className="space-y-4 text-sm font-sans">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-bold text-foreground mb-1">{order.shippingAddress.name}</p>
                    <p className="text-foreground/60 leading-relaxed">
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.zip}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-foreground/60">
                  <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Support Actions */}
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center gap-3 border border-white/10 hover:bg-white/5 py-4 rounded-xl transition-all text-[10px] uppercase tracking-widest font-bold">
                <MessageSquare className="w-4 h-4 text-accent" />
                Contact Support
              </button>
              <Link 
                href="/shop"
                className="w-full flex items-center justify-center gap-3 border border-white/10 hover:bg-white/5 py-4 rounded-xl transition-all text-[10px] uppercase tracking-widest font-bold"
              >
                <RefreshCcw className="w-4 h-4 text-accent" />
                Reorder These Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

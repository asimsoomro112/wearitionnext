"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useOrderTrackingStore } from '../store/orderTrackingStore';
import { sendOrderStatusEmail } from '@/lib/emailService';
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
  Box,
  XCircle
} from 'lucide-react';
import { SEO } from '../components/layout/SEO';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function OrderTracking() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const initialEmail = searchParams.get('email') || '';
  
  const [orderId, setOrderId] = useState(initialId);
  const [hasSearched, setHasSearched] = useState(!!initialId);
  const [order, setOrder] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getOrder, updateOrderStatus } = useOrderTrackingStore();

  const handleCancelOrder = async () => {
    if (!order || order.status !== 'pending') return;
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      setIsSearching(true);
      try {
        await updateOrderStatus(order.id, 'cancelled');
        // Refresh local state to reflect cancellation
        const updatedOrder = await getOrder(order.orderId);
        if (updatedOrder) {
          setOrder(updatedOrder);
          // Send cancellation email
          sendOrderStatusEmail({
            email: updatedOrder.email,
            name: updatedOrder.shippingAddress?.name?.split(' ')[0] || 'Customer',
            orderId: updatedOrder.orderId,
            status: 'cancelled',
          }).catch(console.error);
        }
        toast.success("Your order has been cancelled successfully.");
      } catch (error) {
        console.error("Cancellation error:", error);
        toast.error("Failed to cancel order. Please try again or contact support.");
      } finally {
        setIsSearching(false);
      }
    }
  };

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
        setError(null);
      } else {
        setOrder(null);
        setError('Order not found. Please check the ID and try again.');
      }
    } catch (err: any) {
      console.error('Order lookup failed:', err);
      setError(err.message || 'Failed to fetch order details. Please check your connection.');
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
      <div className="w-full pt-40 px-6 md:px-12 pb-36 bg-[#050505] text-white min-h-screen flex flex-col justify-center">
        <SEO title="Track Order • WEARITION" />
        <div className="max-w-[540px] mx-auto text-center w-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[9px] uppercase tracking-[0.25em] text-white/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>ATELIER DISPATCH TRACKER</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-4 uppercase tracking-tight text-white">Track Order</h1>
          <p className="text-white/40 mb-10 font-sans text-xs tracking-wide">
            Enter your unique atelier order reference to view real-time tailoring, dispatch, and courier progression.
          </p>
          
          <form onSubmit={handleTrack} className="space-y-4">
            <input 
              required 
              value={orderId} 
              onChange={(e) => setOrderId(e.target.value)} 
              type="text" 
              placeholder="ORDER ID (E.G. WR-XXXXXX)" 
              className="w-full bg-white/[0.03] border border-white/15 px-6 py-4 text-xs focus:outline-none focus:border-white transition-colors uppercase tracking-[0.25em] text-center font-mono text-white placeholder-white/25 rounded-full shadow-inner" 
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="w-full bg-white text-black py-4 uppercase text-[10px] tracking-[0.25em] font-bold hover:bg-white/90 transition-all duration-300 disabled:opacity-50 rounded-full shadow-2xl"
            >
              {isSearching ? 'Accessing Archives...' : 'Track Shipment ↗'}
            </button>
          </form>

          {isSearching && (
             <p className="mt-4 text-[10px] text-white/50 animate-pulse uppercase tracking-widest font-mono">Verifying Reference: {orderId}</p>
          )}

          {hasSearched && !order && !isSearching && (
            <div className="mt-8 p-4 rounded-sm border border-white/10 bg-white/[0.02] space-y-1.5">
              <p className="text-white text-xs font-mono">{error || `Reference "${orderId}" not found in current records.`}</p>
              <p className="text-white/40 text-[9px] uppercase tracking-widest font-sans">Please verify the Order ID listed on your confirmation receipt.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentStatusIdx = getStatusIndex(order.status);
  const computedSubtotal = order.subtotal || order.items.reduce((acc: number, item: any) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
  const computedShipping = order.shippingDetails?.shippingAmount || 0;
  const computedTotal = (order.total && order.total > computedShipping) ? order.total : (computedSubtotal + computedShipping);

  return (
    <div className="w-full pt-36 md:pt-40 px-6 md:px-12 pb-36 bg-[#050505] text-white min-h-screen">
      <SEO title={`Order ${order.orderId} • Tracking • WEARITION`} />
      
      <div className="max-w-[1280px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-white/40 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>ATELIER DISPATCH REFERENCE</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white uppercase tracking-tight">{order.orderId}</h1>
            <p className="text-white/40 text-xs font-sans mt-1">
              Authorized on {new Date(order.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="border border-white/20 bg-white/10 px-5 py-2 rounded-full">
            <span className="text-white text-[10px] uppercase tracking-[0.22em] font-mono font-semibold">
              STATUS: {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: Tracking Timeline */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-sm p-6 md:p-10 shadow-2xl">
              <div className="flex items-center gap-3 mb-10 pb-4 border-b border-white/5">
                <Box className="w-4 h-4 text-white" />
                <h2 className="font-serif text-xl uppercase tracking-wider text-white">Progression Stepper</h2>
              </div>

              {order.status === 'cancelled' ? (
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-8 text-center flex flex-col items-center">
                  <XCircle className="w-10 h-10 text-white/50 mb-4" />
                  <h3 className="font-serif text-2xl text-white mb-2 uppercase tracking-wide">Acquisition Cancelled</h3>
                  <p className="text-white/40 text-xs font-sans max-w-md mx-auto leading-relaxed">
                    This order has been archived. The reserved atelier inventory has been returned to the catalogue.
                  </p>
                </div>
              ) : (
                <div className="relative space-y-10 pl-2">
                  {/* Vertical Line */}
                  <div className="absolute left-[26px] top-4 bottom-4 w-[1px] bg-white/10" />

                  {statusSteps.map((step, idx) => {
                    const isActive = idx <= currentStatusIdx;
                    const Icon = step.icon;
                    
                    return (
                      <div key={idx} className="flex gap-6 relative items-start">
                        <div className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isActive 
                            ? 'bg-white text-black shadow-xl font-bold' 
                            : 'bg-[#070707] border border-white/15 text-white/30'
                        }`}>
                          {isActive ? <CheckCircle className="w-5 h-5 text-black" /> : <span className="text-xs font-bold font-mono">{idx + 1}</span>}
                        </div>
                        
                        <div className="flex-1 pt-1.5">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className={`text-xs font-bold uppercase tracking-[0.2em] ${isActive ? 'text-white' : 'text-white/30'}`}>
                              {step.label}
                            </h3>
                            {isActive && idx === 0 && (
                              <span className="text-[10px] text-white/40 font-mono">
                                {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-sans leading-relaxed ${isActive ? 'text-white/60' : 'text-white/20'}`}>
                            {step.status === 'shipped' && order.trackingNumber 
                              ? `Consigned via ${order.courierName || 'Courier'}. Consignment #: ${order.trackingNumber}`
                              : step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom: Items List */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-sm p-6 md:p-8 shadow-2xl">
              <h2 className="text-[11px] uppercase tracking-[0.2em] mb-6 pb-3 border-b border-white/5 font-semibold text-white">Acquired Silhouettes ({order.items.length})</h2>
              <div className="space-y-4">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-20 bg-neutral-900 rounded-sm border border-white/10 overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-sans font-medium uppercase tracking-wide text-white">{item.title}</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-sans">
                          {item.quantity} Unit{item.quantity > 1 ? 's' : ''} {item.size && `· Size: ${item.size}`} {item.color && `· ${item.color}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-mono font-medium text-white">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Summary & Address */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-sm p-6 md:p-8 shadow-2xl">
              <h2 className="text-[11px] uppercase tracking-[0.2em] mb-6 pb-3 border-b border-white/5 font-semibold text-white">Financial Summary</h2>
              <div className="space-y-3 font-sans text-xs">
                <div className="flex justify-between text-white/60">
                  <span className="uppercase tracking-wider text-[10px]">Subtotal</span>
                  <span className="font-mono text-white">{formatCurrency(computedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span className="uppercase tracking-wider text-[10px]">Express Courier</span>
                  <span className="font-mono text-white">
                    {computedShipping > 0 ? formatCurrency(computedShipping) : 'COMPLIMENTARY'}
                  </span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-baseline font-medium text-white">
                  <span className="uppercase tracking-[0.2em] text-xs">Total</span>
                  <span className="font-mono text-xl font-medium">{formatCurrency(computedTotal)}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Protocol: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-sm p-6 md:p-8 shadow-2xl">
              <h2 className="text-[11px] uppercase tracking-[0.2em] mb-6 pb-3 border-b border-white/5 font-semibold text-white">Consignment Destination</h2>
              <div className="space-y-4 text-xs font-sans">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white mb-1">{order.shippingAddress.name}</p>
                    <p className="text-white/50 leading-relaxed font-sans">
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.zip}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/60 pt-2 border-t border-white/5">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <p className="font-mono text-xs">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Support Actions */}
            <div className="space-y-2.5">
              <a 
                href={`https://wa.me/923333744318?text=${encodeURIComponent(`Hello WEARITION Support, I would like an update on Order ${order.orderId}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 border border-white/15 hover:border-white/30 hover:bg-white/[0.04] py-3.5 rounded-full transition-all text-[10px] uppercase tracking-[0.2em] font-semibold text-white/80 hover:text-white"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact Atelier Concierge ↗</span>
              </a>

              {order.status === 'pending' && (
                <button 
                  onClick={handleCancelOrder}
                  disabled={isSearching}
                  className="w-full flex items-center justify-center gap-2.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white py-3.5 rounded-full transition-all text-[10px] uppercase tracking-[0.2em] font-semibold disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isSearching ? 'Processing...' : 'Cancel Order'}</span>
                </button>
              )}

              <Link 
                href="/shop"
                className="w-full flex items-center justify-center gap-2.5 bg-white text-black py-3.5 rounded-full transition-all text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white/90 shadow-xl"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Browse Atelier Collections ↗</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

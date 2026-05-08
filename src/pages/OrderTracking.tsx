import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrderTrackingStore } from '../store/orderTrackingStore';
import { formatCurrency } from '../utils/currency';
import { MapPin, Package, Truck, CheckCircle } from 'lucide-react';

export function OrderTracking() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  
  const [orderId, setOrderId] = useState(initialId);
  const [email, setEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [order, setOrder] = useState<any>(null);
  
  const getOrder = useOrderTrackingStore(state => state.getOrder);

  useEffect(() => {
    // If we have an ID from params, we might still need the email to retrieve it securely,
    // but in a mockup without auth, we might just look it up if we don't strictly require email.
    // For realism, let's require both but pre-fill ID.
  }, [initialId]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const foundOrder = getOrder(orderId, email);
    setOrder(foundOrder || null);
  };

  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-screen">
      <div className="max-w-[800px] mx-auto">
        <header className="mb-12 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-foreground mb-6 uppercase">Track Your Order</h1>
          <p className="text-foreground/60 text-sm max-w-xl mx-auto font-sans">
            Enter your order tracking ID and the email address used during checkout.
          </p>
        </header>

        <form onSubmit={handleTrack} className="flex flex-col gap-6 md:flex-row mb-16">
          <input 
            required 
            value={orderId} 
            onChange={(e) => setOrderId(e.target.value)} 
            type="text" 
            placeholder="Order ID (e.g. PK-123456)" 
            className="flex-1 bg-background-secondary border border-white/10 px-6 py-4 text-sm focus:outline-none focus:border-white/30" 
          />
          <input 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            placeholder="Email Address" 
            className="flex-1 bg-background-secondary border border-white/10 px-6 py-4 text-sm focus:outline-none focus:border-white/30" 
          />
          <button type="submit" className="bg-foreground text-background px-10 py-4 text-xs uppercase tracking-widest hover:bg-accent transition-colors font-medium">
            Track
          </button>
        </form>

        {hasSearched && (
          <div className="bg-background-secondary/20 border border-white/5 p-8 md:p-12">
            {!order ? (
              <div className="text-center text-red-500 font-sans">
                Order not found. Please verify your order ID and email.
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-end mb-12 border-b border-foreground/10 pb-6">
                  <div>
                    <h2 className="text-xl font-serif text-foreground">Order: {order.id}</h2>
                    <p className="text-sm font-sans text-foreground/50 mt-2">Placed on {new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-sans text-foreground/50">Total</p>
                    <p className="text-lg font-sans text-foreground">{formatCurrency(order.total)}</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -z-10" />
                  <div className="flex justify-between items-center relative z-10 w-full max-w-2xl mx-auto">
                    {[
                      { status: 'processing', label: 'Processing', icon: Package },
                      { status: 'shipped', label: 'Shipped', icon: Truck },
                      { status: 'delivered', label: 'Delivered', icon: CheckCircle }
                    ].map((step, idx) => {
                      const isActive = 
                        order.status === step.status || 
                        (order.status === 'delivered') || 
                        (order.status === 'shipped' && idx === 0);
                        
                      const Icon = step.icon;
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${isActive ? 'bg-foreground text-background' : 'bg-background-secondary border border-white/20 text-foreground/40'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className={`text-xs uppercase tracking-widest ${isActive ? 'text-foreground' : 'text-foreground/40'}`}>{step.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

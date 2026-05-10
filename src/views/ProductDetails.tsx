"use client";
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { useWishlistStore } from '../store/wishlistStore';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import { triggerHaptic } from '@/lib/haptics';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { MagneticButton } from '../components/layout/MagneticButton';
import { getOptimizedImage } from '../lib/images';
import { Eye, ChevronDown, ChevronUp, AlertCircle, ShoppingBag, Truck, ShieldCheck, Banknote, Share2 } from "lucide-react";
import { WearitionSpinner } from '../components/layout/WearitionSpinner';

export function ProductDetails() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const addItem = useCartStore(state => state.addItem);
  const openCart = useUIStore(state => state.openCart);
  const { wishlistIds, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (e) {
        console.error('Failed to fetch product:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
     return <WearitionSpinner />;
  }

  if (!product) {
     return <div className="min-h-screen flex items-center justify-center pt-24">Product not found</div>;
  }

  const isWished = product ? wishlistIds.includes(product.id) : false;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This item is currently out of stock');
      return;
    }
    if (!selectedSize && !product.isUnstitched) {
      toast.error('Please select a size first');
      return;
    }
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || '',
      quantity: quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    });
    triggerHaptic('success');
    toast.success(`${quantity}x ${product.title} added to your bag`);
    openCart();
    setQuantity(1); // reset after adding
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    triggerHaptic('medium');
    toggleWishlist(product.id);
    if (!isWished) {
      toast.success(`${product.title} added to your wishlist`);
    } else {
      toast(`${product.title} removed from your wishlist`);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    triggerHaptic('light');
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} at WEARITION.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };


  return (
    <div className="w-full relative bg-background">
      <SEO 
        title={product.title}
        description={product.description || `Shop ${product.title} at WEARITION — Premium luxury fashion from Pakistan.`}
        image={product.images?.[0]}
        type="product"
      />
      <div className="flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
        {/* Left Side: Professional Image Gallery (Vertical Stack for Desktop) */}
        <div className="w-full md:w-[60%] flex flex-col pt-24 md:pt-32 pb-12 px-4 md:px-12 gap-6">
          <div className="flex flex-col gap-6 md:gap-8">
            {(() => {
              const displayImages = (selectedColor && product.colorImages?.[selectedColor] && product.colorImages[selectedColor].length > 0)
                ? product.colorImages[selectedColor]
                : product.images;
                
              return displayImages && displayImages.length > 0 ? (
                displayImages.map((img: string, idx: number) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="w-full aspect-[3/4] bg-foreground/5 overflow-hidden rounded-sm relative group cursor-zoom-in"
                  >
                    <img 
                      src={getOptimizedImage(img)} 
                      alt={`${product.title} view ${idx + 1}`} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover md:object-contain bg-[#f9f9f9] transition-transform duration-1000 group-hover:scale-[1.03]" 
                    />
                    
                    {/* Subtle Overlay Badge */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/80 backdrop-blur-sm px-4 py-2 text-[8px] uppercase tracking-widest text-black font-bold">
                        Enlarge View
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="w-full aspect-[3/4] bg-foreground/5 flex items-center justify-center text-foreground/20 uppercase tracking-widest text-xs">No Images Available</div>
              );
            })()}
          </div>
        </div>

        {/* Right Side: Product Information */}
        <div className="w-full md:w-[40%] md:sticky md:top-0 h-auto md:h-screen overflow-y-auto hide-scrollbar pt-12 md:pt-40 px-6 md:pl-12 md:pr-24 flex flex-col pb-32">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-accent uppercase tracking-[0.3em] font-medium text-[10px] mb-6">The House</p>
            <TextReveal as="h1" className="font-serif text-4xl md:text-6xl text-foreground leading-[1.1] mb-6">{product.title}</TextReveal>
            
            <div className="flex items-center gap-4 mb-12">
              <p className="text-xl text-foreground/80 font-sans">{formatCurrency(product.price)}</p>
              {isLowStock && (
                <span className="text-[10px] uppercase tracking-widest bg-accent/20 text-accent px-3 py-1 font-bold animate-pulse">Only {product.stock} Left</span>
              )}
              {isOutOfStock && (
                <span className="text-[10px] uppercase tracking-widest bg-red-500/20 text-red-500 px-3 py-1 font-bold">Out of Stock</span>
              )}
            </div>
            
            <div className="mb-12 text-foreground/60 text-sm leading-relaxed font-sans">
              {product.description || 'No description available for this item.'}
            </div>

            <div className="flex flex-col gap-8 mb-12 border-y border-white/10 py-10">
               {/* Color Selection */}
               {product.colors && product.colors.length > 0 && (
                 <div>
                   <div className="flex justify-between items-center mb-6">
                     <span className="uppercase text-xs tracking-[0.2em] text-foreground">Select Color</span>
                   </div>
                   <div className="flex gap-4 flex-wrap">
                     {product.colors.map((color: string) => (
                       <button 
                         key={color}
                         onClick={() => { setSelectedColor(color); triggerHaptic('light'); }}
                         className={`px-6 py-3 border transition-all ${selectedColor === color ? 'border-accent bg-accent/10 text-accent font-bold' : 'border-white/10 text-foreground/50 hover:border-white/30'}`}
                       >
                         <span className="uppercase text-[10px] tracking-widest">{color}</span>
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               {!product.isUnstitched && (
                 <div>
                    <div className="flex justify-between items-center mb-6">
                       <span className="uppercase text-xs tracking-[0.2em] text-foreground">Select Size</span>
                       <button className="text-[10px] uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors border-b border-transparent hover:border-foreground">Size Guide</button>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                       {(product.sizes && product.sizes.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL']).map((size: string) => (
                          <button 
                             key={size}
                             onClick={() => { setSelectedSize(size); triggerHaptic('light'); }}
                             className={`w-14 h-14 border ${selectedSize === size ? 'border-foreground bg-foreground text-background font-bold' : 'border-foreground/20 text-foreground hover:border-foreground/50'} flex items-center justify-center font-sans text-sm transition-colors`}
                          >
                             {size}
                          </button>
                       ))}
                    </div>
                 </div>
               )}

               {/* Quantity Selector */}
               {!isOutOfStock && (
                 <div>
                    <div className="flex justify-between items-center mb-6">
                       <span className="uppercase text-xs tracking-[0.2em] text-foreground">Quantity</span>
                    </div>
                    <div className="flex items-center border border-white/10 w-fit rounded-full overflow-hidden">
                       <button 
                         onClick={() => setQuantity(q => Math.max(1, q - 1))}
                         className="px-5 py-3 hover:bg-white/5 transition-colors text-foreground/60 hover:text-foreground"
                         disabled={quantity <= 1}
                       >-</button>
                       <span className="px-6 py-3 font-mono text-sm">{quantity}</span>
                       <button 
                         onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                         className="px-5 py-3 hover:bg-white/5 transition-colors text-foreground/60 hover:text-foreground"
                         disabled={quantity >= product.stock}
                       >+</button>
                    </div>
                 </div>
               )}
            </div>

            <MagneticButton 
              className={`w-full py-6 uppercase text-xs tracking-[0.2em] font-medium transition-colors duration-300 mb-4 rounded-full ${isOutOfStock ? 'bg-foreground/20 text-foreground/40 cursor-not-allowed' : 'bg-foreground text-background hover:bg-accent hover:text-background'}`}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </MagneticButton>


            <div className="flex gap-4 mb-8">
              <button 
                onClick={handleWishlistToggle}
                className="flex-1 border border-foreground/30 text-foreground py-6 uppercase text-xs tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors duration-300 rounded-full"
              >
                {isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
              <button 
                onClick={handleShare}
                className="w-16 flex items-center justify-center border border-foreground/30 text-foreground hover:bg-white/5 transition-colors duration-300 rounded-full"
                aria-label="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Badges (Conversion Boosters) */}
            <div className="flex flex-col gap-3 mb-16 p-4 rounded-xl bg-foreground/5 border border-white/5">
              <div className="flex items-center gap-3 text-foreground/80">
                <Banknote className="w-5 h-5 text-emerald-400" />
                <span className="text-xs uppercase tracking-widest font-bold">Cash on Delivery Available</span>
              </div>
              <div className="flex items-center gap-3 text-foreground/80">
                <Truck className="w-5 h-5 text-blue-400" />
                <span className="text-xs tracking-wider">Nationwide Delivery (Rs. 250)</span>
              </div>
              <div className="flex items-center gap-3 text-foreground/80">
                <ShieldCheck className="w-5 h-5 text-accent" />
                <span className="text-xs tracking-wider">100% Authentic Luxury Brands</span>
              </div>
            </div>

            {/* Accordions simulate */}
            <div className="divide-y divide-white/10 border-t border-white/10">
               <details className="group py-6 cursor-pointer">
                  <summary className="flex justify-between items-center uppercase text-xs tracking-[0.2em] font-medium text-foreground list-none">
                     Details & Care
                     <span className="transition-transform duration-300 group-open:rotate-180 text-lg font-light">+</span>
                  </summary>
                  <p className="mt-6 text-foreground/60 text-sm leading-relaxed font-sans">Premium quality fabric. Handle with care. Refer to the product label for specific washing instructions. Sourced from Pakistan's finest fashion houses.</p>
               </details>
               <details className="group py-6 cursor-pointer">
                  <summary className="flex justify-between items-center uppercase text-xs tracking-[0.2em] font-medium text-foreground list-none">
                     Shipping & Returns
                     <span className="transition-transform duration-300 group-open:rotate-180 text-lg font-light">+</span>
                  </summary>
                  <p className="mt-6 text-foreground/60 text-sm leading-relaxed font-sans">Nationwide delivery across Pakistan via TCS, Leopards & M&P. Standard shipping Rs. 250. Cash on Delivery available. Easy returns within 3 days of delivery.</p>
               </details>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

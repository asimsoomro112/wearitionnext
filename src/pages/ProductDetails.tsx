import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { useWishlistStore } from '../store/wishlistStore';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/currency';
import { triggerHaptic } from '../utils/haptics';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { MagneticButton } from '../components/layout/MagneticButton';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';
import { MessageSquare } from 'lucide-react';

export function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
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
     return <div className="min-h-screen flex items-center justify-center pt-24"><div className="w-8 h-8 border-t border-white rounded-full animate-spin"></div></div>;
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
    if (!selectedSize) {
      toast.error('Please select a size first');
      return;
    }
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || '',
      quantity: 1,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    });
    triggerHaptic('success');
    toast.success(`${product.title} added to your bag`);
    openCart();
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

  const whatsappOrderUrl = `https://wa.me/923000000000?text=${encodeURIComponent(`Hi! I'd like to order "${product.title}" (${formatCurrency(product.price)}) from Wearition. Size: ${selectedSize || 'Not selected'}. Link: ${window.location.href}`)}`;

  return (
    <div className="w-full relative bg-background">
      <SEO 
        title={product.title}
        description={product.description || `Shop ${product.title} at WEARITION — Premium luxury fashion from Pakistan.`}
        image={product.images?.[0]}
        type="product"
      />
      <div className="flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
        {/* Left Side: Sticky/Scroll Image Gallery */}
        <div className="w-full md:w-[60%] flex flex-col pt-24 md:pt-32 pb-12 px-6 md:px-12 gap-4">
          {product.images && product.images.length > 0 ? (
            product.images.map((img: string, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="w-full aspect-[3/4] bg-background-secondary overflow-hidden"
              >
                <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </motion.div>
            ))
          ) : (
            <div className="w-full aspect-[3/4] bg-background-secondary flex items-center justify-center p-2">
               <div className="w-full h-full bg-background flex items-center justify-center text-foreground/20 uppercase tracking-widest text-sm">Image Placeholder</div>
            </div>
          )}
        </div>

        {/* Right Side: Product Information */}
        <div className="w-full md:w-[40%] md:sticky md:top-0 h-screen overflow-y-auto hide-scrollbar pt-12 md:pt-40 px-6 md:pl-12 md:pr-24 flex flex-col pb-24">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-accent uppercase tracking-[0.3em] font-medium text-[10px] mb-6">The House</p>
            <TextReveal as="h1" className="font-serif text-5xl md:text-6xl text-foreground leading-[1.1] mb-6">{product.title}</TextReveal>
            
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

            <div className="flex flex-col gap-6 mb-12 border-y border-white/10 py-10">
               <div>
                  <div className="flex justify-between items-center mb-6">
                     <span className="uppercase text-xs tracking-[0.2em] text-foreground">Select Size</span>
                     <button className="text-[10px] uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors border-b border-transparent hover:border-foreground">Size Guide</button>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                     {(product.sizes && product.sizes.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL']).map((size: string) => (
                        <button 
                           key={size}
                           onClick={() => setSelectedSize(size)}
                           className={`w-14 h-14 border ${selectedSize === size ? 'border-foreground bg-foreground text-background' : 'border-foreground/20 text-foreground hover:border-foreground/50'} flex items-center justify-center font-sans text-sm transition-colors`}
                        >
                           {size}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            <MagneticButton 
              className={`w-full py-6 uppercase text-xs tracking-[0.2em] font-medium transition-colors duration-300 mb-4 ${isOutOfStock ? 'bg-foreground/20 text-foreground/40 cursor-not-allowed' : 'bg-foreground text-background hover:bg-accent hover:text-background'}`}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </MagneticButton>

            <a 
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-[#25D366]/30 text-[#25D366] py-6 uppercase text-xs tracking-[0.2em] font-medium hover:bg-[#25D366]/10 transition-colors duration-300 mb-4 flex items-center justify-center gap-3"
            >
              <MessageSquare className="w-4 h-4" />
              Order on WhatsApp
            </a>

            <button 
              onClick={handleWishlistToggle}
              className="w-full border border-foreground/30 text-foreground py-6 uppercase text-xs tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors duration-300 mb-16"
            >
              {isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>

            {/* Accordions simulate */}
            <div className="divide-y divide-white/10 border-t border-white/10">
               <details className="group py-6 cursor-pointer">
                  <summary className="flex justify-between items-center uppercase text-xs tracking-[0.2em] font-medium text-foreground list-none">
                     Details & Care
                     <span className="transition-transform duration-300 group-open:rotate-180 text-lg font-light">+</span>
                  </summary>
                  <p className="mt-6 text-foreground/60 text-sm leading-relaxed font-sans">Dry clean only. Handle with care. Made in Italy.</p>
               </details>
               <details className="group py-6 cursor-pointer">
                  <summary className="flex justify-between items-center uppercase text-xs tracking-[0.2em] font-medium text-foreground list-none">
                     Shipping & Returns
                     <span className="transition-transform duration-300 group-open:rotate-180 text-lg font-light">+</span>
                  </summary>
                  <p className="mt-6 text-foreground/60 text-sm leading-relaxed font-sans">Complimentary express shipping and free returns within 14 days.</p>
               </details>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

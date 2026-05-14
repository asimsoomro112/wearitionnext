"use client";
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
import {
  Eye, AlertCircle, ShoppingBag, Truck, ShieldCheck,
  Banknote, Share2, Heart, Star, ChevronRight, X,
  ZoomIn, MessageCircle, Clock, Package, RotateCcw,
  CheckCircle2, Users, Flame, ChevronDown
} from "lucide-react";
import { WearitionSpinner } from '../components/layout/WearitionSpinner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  location: string;
}

// ─── Static Mock Reviews (replace with Firestore sub-collection later) ────────
const MOCK_REVIEWS: Review[] = [
  { name: "Ayesha M.", rating: 5, comment: "Absolutely stunning quality. The fabric is luxurious and the fit is perfect. Will definitely order again!", date: "2 days ago", verified: true, location: "Lahore" },
  { name: "Fatima K.", rating: 5, comment: "Received so many compliments. Fast delivery and packaging was premium.", date: "1 week ago", verified: true, location: "Karachi" },
  { name: "Sana R.", rating: 4, comment: "Beautiful piece, exactly as shown. Slightly bigger than expected but overall very happy.", date: "2 weeks ago", verified: true, location: "Islamabad" },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

/** Floating real-time social proof badge */
function ViewersBadge({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 
                 rounded-full px-3 py-1.5 mb-4"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">
        {count} people viewing right now
      </span>
    </motion.div>
  );
}

/** Recent purchase notification (pops up from bottom-left) */
function PurchaseNotification() {
  const [visible, setVisible] = useState(false);
  const notifications = [
    { city: "Lahore", item: "just purchased this", time: "2 min ago" },
    { city: "Karachi", item: "just added to wishlist", time: "5 min ago" },
    { city: "Islamabad", item: "just purchased this", time: "8 min ago" },
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(show);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const hide = setTimeout(() => setVisible(false), 4500);
    const next = setTimeout(() => {
      setCurrent(c => (c + 1) % notifications.length);
      setVisible(true);
    }, 12000);
    return () => { clearTimeout(hide); clearTimeout(next); };
  }, [visible, current]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -40, y: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="fixed bottom-24 left-4 z-50 bg-background border border-foreground/10 
                     rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl max-w-[260px]"
        >
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-[11px] text-foreground font-semibold">
              Someone from <span className="text-accent">{notifications[current].city}</span>
            </p>
            <p className="text-[10px] text-foreground/50">{notifications[current].item} · {notifications[current].time}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Image lightbox / zoom modal */
function ImageLightbox({ images, activeIndex, onClose }: {
  images: string[]; activeIndex: number; onClose: () => void;
}) {
  const [idx, setIdx] = useState(activeIndex);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => Math.min(images.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>
      <motion.img
        key={idx}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        src={getOptimizedImage(images[idx])}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={e => e.stopPropagation()}
      />
      {/* Thumbnails */}
      <div className="absolute bottom-6 flex gap-2 flex-wrap justify-center px-4">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={e => { e.stopPropagation(); setIdx(i); }}
            className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
              i === idx ? 'border-accent' : 'border-white/20 opacity-50 hover:opacity-80'
            }`}
          >
            <img src={getOptimizedImage(img)} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/** Star rating display */
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${s} ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-foreground/20'}`}
        />
      ))}
    </div>
  );
}

/** Size Guide Modal */
function SizeGuideModal({ onClose }: { onClose: () => void }) {
  const sizes = [
    { size: 'XS', chest: '32"', waist: '26"', hips: '34"' },
    { size: 'S', chest: '34"', waist: '28"', hips: '36"' },
    { size: 'M', chest: '36"', waist: '30"', hips: '38"' },
    { size: 'L', chest: '38"', waist: '32"', hips: '40"' },
    { size: 'XL', chest: '40"', waist: '34"', hips: '42"' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/80 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="bg-background border border-foreground/10 rounded-2xl p-8 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-foreground font-serif text-xl">Size Guide</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-foreground/40 hover:text-foreground" /></button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/10">
              {['Size', 'Chest', 'Waist', 'Hips'].map(h => (
                <th key={h} className="pb-3 text-left text-[10px] uppercase tracking-widest text-foreground/40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map(row => (
              <tr key={row.size} className="border-b border-foreground/5">
                {[row.size, row.chest, row.waist, row.hips].map((cell, i) => (
                  <td key={i} className={`py-3 ${i === 0 ? 'text-accent font-bold' : 'text-foreground/70'}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[11px] text-foreground/30 mt-4">All measurements are in inches. If between sizes, size up.</p>
      </motion.div>
    </motion.div>
  );
}

/** Sticky Mobile CTA bar */
function StickyMobileCTA({
  product, isOutOfStock, onAddToCart, onBuyNow
}: { product: any; isOutOfStock: boolean; onAddToCart: () => void; onBuyNow: () => void }) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 
                 backdrop-blur-2xl border-t border-foreground/10 px-6 py-5 
                 flex flex-col items-center gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold">
        <span className="text-foreground/40 truncate max-w-[150px]">{product.title}</span>
        <span className="text-foreground/20">|</span>
        <span className="text-accent">{formatCurrency(product.price)}</span>
      </div>
      
      <div className="flex gap-3 w-full max-w-md">
        <button
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]
                     transition-all duration-300 border ${
                       isOutOfStock
                         ? 'border-foreground/10 text-foreground/30 cursor-not-allowed'
                         : 'border-foreground/20 text-foreground active:scale-95'
                     }`}
        >
          {isOutOfStock ? 'Sold' : 'Add to Bag'}
        </button>
        <button
          onClick={onBuyNow}
          disabled={isOutOfStock}
          className={`flex-[1.5] py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]
                     transition-all duration-300 ${
                       isOutOfStock
                         ? 'bg-foreground/10 text-foreground/30 cursor-not-allowed'
                         : 'bg-accent text-black active:scale-95 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]'
                     }`}
        >
          {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProductDetails() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'care'>('description');
  const [viewerCount] = useState(() => Math.floor(Math.random() * 12) + 4);

  const addItem = useCartStore(state => state.addItem);
  const openCart = useUIStore(state => state.openCart);
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const router = useRouter();

  // Scroll-based parallax on hero image
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 500], [0, -40]);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          const data = snap.id ? { id: snap.id, ...snap.data() } as any : null;
          setProduct(data);
          // Default to first color if available
          if (data?.colors?.length > 0) {
            setSelectedColor(data.colors[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // ─── Derived State ─────────────────────────────────────────────────────────
  const isWished = product ? wishlistIds.includes(product.id) : false;
  const isOutOfStock = product?.stock === 0;
  const isLowStock = product?.stock > 0 && product?.stock <= 5;
  const avgRating = 4.8;
  const reviewCount = 47;

  // Filter images strictly based on color if available
  const displayImages = useMemo(() => {
    if (!product) return [];
    if (selectedColor && product.colorImages?.[selectedColor]?.length > 0) {
      return product.colorImages[selectedColor];
    }
    return product.images || [];
  }, [product, selectedColor]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) { toast.error('This item is currently out of stock'); return; }
    if (!selectedSize && !product?.isUnstitched) { toast.error('Please select a size first'); return; }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || '',
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    triggerHaptic('success');
    toast.success(`${quantity}x ${product.title} added to your bag`, {
      description: 'Free delivery on orders above Rs. 3000',
      icon: '🛍️',
    });
    openCart();
    setQuantity(1);
  }, [isOutOfStock, selectedSize, product, quantity, selectedColor, addItem, openCart]);

  const handleBuyNow = useCallback(() => {
    if (isOutOfStock) { toast.error('This item is currently out of stock'); return; }
    if (!selectedSize && !product?.isUnstitched) { toast.error('Please select a size first'); return; }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || '',
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    triggerHaptic('success');
    router.push('/checkout');
  }, [isOutOfStock, selectedSize, product, quantity, selectedColor, addItem, router]);

  const handleWishlistToggle = useCallback(() => {
    if (!product) return;
    triggerHaptic('medium');
    toggleWishlist(product.id);
    toast(isWished ? `Removed from wishlist` : `Added to wishlist ❤️`);
  }, [product, isWished, toggleWishlist]);

  const handleShare = useCallback(async () => {
    if (!product) return;
    triggerHaptic('light');
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, text: `Check out ${product.title} at WEARITION.`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } catch { /* user cancelled */ }
  }, [product]);
  if (loading) return <WearitionSpinner />;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center pt-24 text-foreground/40 text-sm">
      Product not found.
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title={product.title}
        description={product.description || `Shop ${product.title} at WEARITION — Premium luxury fashion from Pakistan.`}
        image={product.images?.[0]}
        type="product"
      />

      {/* Real-time notifications */}
      <PurchaseNotification />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <ImageLightbox
            images={displayImages}
            activeIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}
      </AnimatePresence>

      {/* Sticky Mobile CTA */}
      {product && (
        <StickyMobileCTA 
          product={product} 
          isOutOfStock={isOutOfStock} 
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow} 
        />
      )}

      <div className="w-full relative bg-background">

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <div className="w-full max-w-[1600px] mx-auto px-6 pt-40 pb-2 flex items-center gap-2 text-[10px] text-foreground/30 uppercase tracking-widest">
          <span className="hover:text-foreground/60 cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-foreground/60 cursor-pointer transition-colors">Collection</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/50 truncate max-w-[200px]">{product.title}</span>
        </div>

        {/* ── Main Grid ──────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">

          {/* ═══════════════════════ LEFT: Gallery ═══════════════════════ */}
          <div ref={heroRef} className="w-full md:w-[58%] flex flex-col pt-4 md:pt-6 pb-12 px-4 md:px-12 gap-4">
            {displayImages.length > 0 ? displayImages.map((img: string, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: Math.min(idx * 0.08, 0.3) }}
                className="w-full aspect-[3/4] bg-foreground/5 overflow-hidden rounded-xl relative group cursor-zoom-in"
                onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                style={idx === 0 ? { y: imageY } as any : undefined}
              >
                <img
                  src={getOptimizedImage(img)}
                  alt={`${product.title} – view ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover md:object-contain bg-[#f7f5f2] 
                             transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {/* Zoom hint */}
                <div className="absolute inset-0 flex items-end justify-end p-5 opacity-0 
                                group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm 
                                  rounded-full px-3 py-2">
                    <ZoomIn className="w-3.5 h-3.5 text-white" />
                    <span className="text-[9px] uppercase tracking-widest text-white font-medium">
                      Zoom
                    </span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="w-full aspect-[3/4] bg-foreground/5 flex items-center justify-center 
                             text-foreground/20 uppercase tracking-widest text-xs rounded-xl">
                No Images Available
              </div>
            )}
          </div>

          {/* ═══════════════════════ RIGHT: Info Panel ═══════════════════ */}
          <div className="w-full md:w-[42%] md:sticky md:top-0 h-auto md:h-screen 
                         overflow-y-auto hide-scrollbar pt-4 md:pt-32 
                         px-6 md:pl-10 md:pr-20 flex flex-col pb-40 md:pb-24">

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="flex flex-col"
            >
              {/* ── Brand Tag ─────────────────────────────────────────── */}
              <p className="text-accent uppercase tracking-[0.35em] font-semibold text-[9px] mb-3">
                The House of WEARITION
              </p>

              {/* ── Viewers Badge ─────────────────────────────────────── */}
              <ViewersBadge count={viewerCount} />

              {/* ── Title ─────────────────────────────────────────────── */}
              <TextReveal as="h1" className="font-serif text-3xl md:text-5xl text-foreground leading-[1.1] mb-4">
                {product.title}
              </TextReveal>

              {/* ── Rating Row ────────────────────────────────────────── */}
              <div className="flex items-center gap-3 mb-5 cursor-pointer group"
                onClick={() => setActiveTab('reviews')}>
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-amber-400 text-xs font-bold">{avgRating}</span>
                <span className="text-foreground/30 text-xs">·</span>
                <span className="text-foreground/50 text-xs underline underline-offset-2 
                                group-hover:text-foreground transition-colors">
                  {reviewCount} verified reviews
                </span>
              </div>

              {/* ── Price Block ───────────────────────────────────────── */}
              <div className="flex items-baseline gap-4 mb-6">
                <p className="text-3xl text-foreground font-bold tracking-tight">
                  {formatCurrency(product.price)}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <p className="text-foreground/30 line-through text-lg">
                      {formatCurrency(product.originalPrice)}
                    </p>
                    <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 
                                     border border-emerald-500/20 px-2 py-1 rounded-full">
                      SAVE {Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* ── Stock / Urgency Bar ───────────────────────────────── */}
              {isLowStock && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-red-400 font-bold">
                      Selling Fast — {product.stock} items left
                    </span>
                    <span className="text-[10px] text-foreground/30">{product.stock}/{product.stock + 12} sold</span>
                  </div>
                  <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((12) / (product.stock + 12)) * 100}%` }}
                      transition={{ duration: 1.2, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                    />
                  </div>
                </div>
              )}
              {isOutOfStock && (
                <div className="mb-5 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 
                               border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>This item is currently out of stock</span>
                </div>
              )}

              {/* ── Selector Area ─────────────────────────────────────── */}
              <div className="flex flex-col gap-6 mb-8 border-y border-foreground/8 py-8">

                {/* Color */}
                {product.colors?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/70 font-medium">
                        Color: <span className="text-foreground font-bold">{selectedColor || 'Select'}</span>
                      </span>
                    </div>
                    <div className="flex gap-2.5 flex-wrap">
                      {product.colors.map((color: string) => (
                        <button
                          key={color}
                          onClick={() => { setSelectedColor(color); triggerHaptic('light'); }}
                          className={`px-4 py-2.5 rounded-full border text-[10px] uppercase 
                                     tracking-widest font-bold transition-all duration-200 ${
                                       selectedColor === color
                                         ? 'border-accent bg-accent/15 text-accent shadow-[0_0_12px_rgba(var(--accent-rgb),0.3)]'
                                         : 'border-foreground/10 text-foreground/40 hover:border-foreground/30 hover:text-foreground/70'
                                     }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size */}
                {!product.isUnstitched && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/70 font-medium">
                        Size: <span className="text-foreground font-bold">{selectedSize || 'Select'}</span>
                      </span>
                      <button
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-[10px] uppercase tracking-widest text-accent/70 
                                   hover:text-accent transition-colors flex items-center gap-1"
                      >
                        <span>Size Guide</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex gap-2.5 flex-wrap">
                      {(product.sizes?.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL'])
                        .map((size: string) => (
                          <button
                            key={size}
                            onClick={() => { setSelectedSize(size); triggerHaptic('light'); }}
                            className={`w-12 h-12 rounded-xl border font-bold text-sm
                                       transition-all duration-200 ${
                                         selectedSize === size
                                           ? 'border-foreground bg-foreground text-background'
                                           : 'border-foreground/15 text-foreground/60 hover:border-foreground/40 hover:text-foreground'
                                       }`}
                          >
                            {size}
                          </button>
                        ))}
                    </div>
                    {!selectedSize && !product.isUnstitched && (
                      <p className="text-[10px] text-foreground/30 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Select a size to continue
                      </p>
                    )}
                  </div>
                )}

                {/* Quantity */}
                {!isOutOfStock && (
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/70 font-medium">Qty</span>
                    <div className="flex items-center border border-foreground/10 rounded-full overflow-hidden">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center text-foreground/60 
                                   hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-30 
                                   text-lg font-light"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-mono text-foreground">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 flex items-center justify-center text-foreground/60 
                                   hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-30 
                                   text-lg font-light"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Primary CTA ───────────────────────────────────────── */}
              <MagneticButton
                onClick={handleAddToCart}
                className={`relative w-full py-5 rounded-full font-bold uppercase text-xs 
                           tracking-[0.2em] overflow-hidden transition-all duration-300 mb-3
                           group ${
                             isOutOfStock
                               ? 'bg-foreground/10 text-foreground/30 cursor-not-allowed'
                               : 'bg-foreground text-background hover:shadow-[0_0_40px_rgba(var(--foreground-rgb),0.15)]'
                           }`}
              >
                {!isOutOfStock && (
                  <span className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 
                                   translate-x-[-100%] group-hover:translate-x-0 
                                   transition-transform duration-500 ease-out" />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  {isOutOfStock ? 'Out of Stock' : `Add to Bag · ${formatCurrency(product.price * quantity)}`}
                </span>
              </MagneticButton>

              {/* ── Secondary CTAs Row ────────────────────────────────── */}
              <div className="flex gap-2.5 mb-4">
                <button
                  onClick={handleWishlistToggle}
                  className={`flex-1 py-4 rounded-full border text-xs font-bold uppercase 
                             tracking-widest flex items-center justify-center gap-2
                             transition-all duration-300 ${
                               isWished
                                 ? 'border-red-500/50 bg-red-500/10 text-red-400'
                                 : 'border-foreground/15 text-foreground/60 hover:border-foreground/30 hover:text-foreground'
                             }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-red-400' : ''}`} />
                  {isWished ? 'Wishlisted' : 'Wishlist'}
                </button>
                <button
                  onClick={handleShare}
                  className="px-5 py-4 rounded-full border border-foreground/15 text-foreground/60 
                             hover:border-foreground/30 hover:text-foreground transition-all duration-300 
                             flex items-center justify-center"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* ── Trust Badges ──────────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-2.5 mb-8">
                {[
                  { icon: <Banknote className="w-4 h-4 text-emerald-400" />, label: 'Cash on Delivery', sub: 'Nationwide' },
                  { icon: <Truck className="w-4 h-4 text-blue-400" />, label: 'Fast Delivery', sub: 'Rs. 250 shipping' },
                  { icon: <RotateCcw className="w-4 h-4 text-amber-400" />, label: 'Easy Returns', sub: '3 days policy' },
                  { icon: <ShieldCheck className="w-4 h-4 text-accent" />, label: '100% Authentic', sub: 'Verified brands' },
                ].map(({ icon, label, sub }) => (
                  <div key={label}
                    className="flex items-center gap-3 bg-foreground/[0.03] border border-foreground/[0.06] 
                               rounded-xl p-3 hover:border-foreground/10 transition-colors"
                  >
                    {icon}
                    <div>
                      <p className="text-[10px] text-foreground font-semibold">{label}</p>
                      <p className="text-[9px] text-foreground/35">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Delivery Estimator ────────────────────────────────── */}
              <div className="flex items-center gap-3 bg-foreground/[0.03] border border-foreground/[0.06] 
                             rounded-xl p-4 mb-8">
                <Clock className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                <div>
                  <p className="text-xs text-foreground font-medium">
                    Order now → Delivers by{' '}
                    <span className="text-accent">
                      {new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-PK', {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </p>
                  <p className="text-[10px] text-foreground/35 mt-0.5">
                    via TCS / Leopards / M&P
                  </p>
                </div>
              </div>

              {/* ── Tabs: Description / Reviews / Care ────────────────── */}
              <div className="border-t border-foreground/10">
                <div className="flex gap-0 border-b border-foreground/10 mb-6 mt-4">
                  {(['description', 'reviews', 'care'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 pb-3 text-[10px] uppercase tracking-widest font-bold 
                                 transition-all duration-200 relative ${
                                   activeTab === tab
                                     ? 'text-foreground'
                                     : 'text-foreground/30 hover:text-foreground/60'
                                 }`}
                    >
                      {tab === 'reviews' ? `Reviews (${reviewCount})` : tab}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div
                      key="desc"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-foreground/55 text-sm leading-relaxed font-sans mb-6"
                    >
                      {product.description || 'Premium quality piece from WEARITION\'s curated collection. Sourced from Pakistan\'s finest fashion houses.'}
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex flex-col gap-5 mb-6"
                    >
                      {/* Average rating summary */}
                      <div className="flex items-center gap-5 bg-foreground/[0.03] rounded-xl p-4 
                                     border border-foreground/[0.06]">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-foreground">{avgRating}</p>
                          <StarRating rating={5} size="sm" />
                          <p className="text-[10px] text-foreground/30 mt-1">{reviewCount} reviews</p>
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5">
                          {[5, 4, 3, 2, 1].map(star => {
                            const pct = star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 5 : 2;
                            return (
                              <div key={star} className="flex items-center gap-2">
                                <span className="text-[9px] text-foreground/30 w-3">{star}</span>
                                <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-amber-400 rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[9px] text-foreground/30 w-6">{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {/* Individual reviews */}
                      {MOCK_REVIEWS.map((rev, i) => (
                        <div key={i} className="flex flex-col gap-2 pb-4 border-b border-foreground/5 last:border-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center 
                                             justify-center text-accent text-[11px] font-bold">
                                {rev.name[0]}
                              </div>
                              <div>
                                <span className="text-xs text-foreground font-semibold">{rev.name}</span>
                                {rev.verified && (
                                  <span className="ml-1.5 text-[9px] text-emerald-400 flex items-center gap-0.5 inline-flex">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[9px] text-foreground/25">{rev.date} · {rev.location}</span>
                          </div>
                          <StarRating rating={rev.rating} size="sm" />
                          <p className="text-[12px] text-foreground/55 leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'care' && (
                    <motion.div
                      key="care"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-6"
                    >
                      {[
                        { icon: '🌡️', title: 'Wash', detail: 'Cold water, gentle cycle only' },
                        { icon: '🧴', title: 'Dry Clean', detail: 'Recommended for best results' },
                        { icon: '☀️', title: 'Drying', detail: 'Dry in shade, avoid direct sunlight' },
                        { icon: '🔥', title: 'Ironing', detail: 'Low heat, iron inside out' },
                      ].map(({ icon, title, detail }) => (
                        <div key={title} className="flex items-center gap-3 py-3 border-b border-foreground/5 last:border-0">
                          <span className="text-lg">{icon}</span>
                          <div>
                            <p className="text-xs text-foreground font-semibold">{title}</p>
                            <p className="text-[11px] text-foreground/40">{detail}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── UGC Social Proof Strip ────────────────────────────── */}
              <div className="flex items-center gap-3 bg-foreground/[0.03] border border-foreground/[0.06] 
                             rounded-xl p-4 mb-4">
                <div className="flex -space-x-2">
                  {['A', 'F', 'S', 'Z'].map((l, i) => (
                    <div key={i}
                      className="w-7 h-7 rounded-full border-2 border-background 
                                 bg-gradient-to-br from-accent/40 to-accent/10 
                                 flex items-center justify-center text-[9px] font-bold text-foreground"
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-foreground/60">
                  <span className="text-foreground font-semibold">289 customers</span> bought this in the last 30 days
                </p>
              </div>

              {/* ── Tax Note ─────────────────────────────────────────── */}
              <p className="text-[10px] text-foreground/25 text-center mb-4">
                4% Government Tax applied at checkout · Prices in PKR
              </p>

            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

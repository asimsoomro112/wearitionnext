"use client";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  CheckCircle2, ChevronDown
} from "lucide-react";
import { WearitionSpinner } from '../components/layout/WearitionSpinner';

// ─── Sub-Components ───────────────────────────────────────────────────────────

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
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        className="bg-[#0b0b0b] border border-white/10 rounded-sm p-8 max-w-md w-full shadow-2xl text-white"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
          <h3 className="text-white font-serif text-lg uppercase tracking-wider">Atelier Sizing Guide</h3>
          <button onClick={onClose} aria-label="Close guide"><X className="w-5 h-5 text-white/40 hover:text-white transition-colors" /></button>
        </div>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10">
              {['Size', 'Chest', 'Waist', 'Hips'].map(h => (
                <th key={h} className="pb-3 text-left text-[10px] uppercase tracking-widest text-white/40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map(row => (
              <tr key={row.size} className="border-b border-white/5">
                {[row.size, row.chest, row.waist, row.hips].map((cell, i) => (
                  <td key={i} className={`py-3 ${i === 0 ? 'text-white font-bold' : 'text-white/60'}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-6">
          All measurements in inches. Custom fittings available via Atelier Styling.
        </p>
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
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#070707]/95 
                 backdrop-blur-2xl border-t border-white/10 px-6 py-4 
                 flex flex-col items-center gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-center justify-between w-full text-[10px] uppercase tracking-widest font-mono">
        <span className="text-white/50 truncate max-w-[180px]">{product.title}</span>
        <span className="text-white font-medium">{formatCurrency(product.price)}</span>
      </div>
      
      <div className="flex gap-2.5 w-full">
        <button
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]
                     transition-all duration-300 border ${
                       isOutOfStock
                         ? 'border-white/10 text-white/30 cursor-not-allowed'
                         : 'bg-white text-black active:scale-95 shadow-xl'
                     }`}
        >
          {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
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
  const [activeTab, setActiveTab] = useState<'description' | 'care'>('description');

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
      description: 'Free delivery on orders above PKR 10,000',
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
    <div className="min-h-screen flex items-center justify-center pt-24 text-white/40 text-sm bg-[#050505]">
      Product not found.
    </div>
  );

  const whatsappHref = `https://wa.me/923333744318?text=${encodeURIComponent('Hello WEARITION Concierge, I would like to inquire about ' + product.title)}`;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title={product.title}
        description={product.description || `Shop ${product.title} at WEARITION.`}
        image={product.images?.[0]}
        type="product"
      />

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

      <div className="w-full relative bg-[#050505] text-white min-h-screen">

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-36 md:pt-40 pb-4 flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-[0.2em]">
          <Link href="/" className="hover:text-white cursor-pointer transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-white/20" />
          <Link href="/shop" className="hover:text-white cursor-pointer transition-colors">Atelier Collection</Link>
          <ChevronRight className="w-3 h-3 text-white/20" />
          <span className="text-white/70 truncate max-w-[200px]">{product.title}</span>
        </div>

        {/* ── Main Grid ──────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">

          {/* ═══════════════════════ LEFT: Gallery ═══════════════════════ */}
          <div ref={heroRef} className="w-full md:w-[58%] flex flex-col pt-2 md:pt-4 pb-12 px-4 md:px-12 gap-4">
            {displayImages.length > 0 ? displayImages.map((img: string, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: Math.min(idx * 0.08, 0.3) }}
                className="w-full aspect-[3/4] bg-[#0c0c0c] border border-white/5 overflow-hidden rounded-sm relative group cursor-zoom-in"
                onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                style={idx === 0 ? { y: imageY } as any : undefined}
              >
                <img
                  src={getOptimizedImage(img)}
                  alt={`${product.title} – view ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {/* Zoom hint */}
                <div className="absolute inset-0 flex items-end justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-2">
                    <ZoomIn className="w-3.5 h-3.5 text-white" />
                    <span className="text-[9px] uppercase tracking-widest text-white font-medium">
                      Inspect
                    </span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="w-full aspect-[3/4] bg-[#0c0c0c] border border-white/5 flex items-center justify-center text-white/20 uppercase tracking-widest text-xs rounded-sm">
                No Images Available
              </div>
            )}
          </div>

          {/* ═══════════════════════ RIGHT: Info Panel ═══════════════════ */}
          <div className="w-full md:w-[42%] md:sticky md:top-0 h-auto md:h-screen overflow-y-auto hide-scrollbar pt-4 md:pt-32 px-6 md:pl-8 md:pr-16 flex flex-col pb-36 md:pb-24">

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="flex flex-col"
            >
              {/* ── Brand Tag ─────────────────────────────────────────── */}
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-white/40 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>ATELIER HAUTE COUTURE • WEARITION</span>
              </div>


              {/* ── Title ─────────────────────────────────────────────── */}
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight leading-[1.1] mb-4">
                {product.title}
              </h1>


              {/* ── Price Block ───────────────────────────────────────── */}
              <div className="flex items-baseline gap-4 mb-6">
                <p className="text-3xl text-white font-mono font-medium tracking-tight">
                  {formatCurrency(product.price)}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <p className="text-white/30 line-through text-lg font-mono">
                      {formatCurrency(product.originalPrice)}
                    </p>
                    <span className="text-white text-xs font-mono font-medium bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                      SAVE {Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* ── Stock / Urgency Bar ───────────────────────────────── */}
              {isLowStock && (
                <div className="mb-5 p-3.5 rounded-sm bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-white/80 font-bold">
                      Limited Atelier Run — {product.stock} pieces remaining
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">{product.stock} left</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((12) / (product.stock + 12)) * 100}%` }}
                      transition={{ duration: 1.2, delay: 0.5 }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              )}
              {isOutOfStock && (
                <div className="mb-5 flex items-center gap-2 text-white/70 text-xs bg-white/[0.03] border border-white/10 rounded-sm px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-white/50" />
                  <span className="uppercase text-[10px] tracking-widest">This silhouette is currently sold out in the atelier</span>
                </div>
              )}

              {/* ── Selector Area ─────────────────────────────────────── */}
              <div className="flex flex-col gap-6 mb-8 border-y border-white/10 py-8">

                {/* Color */}
                {product.colors?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-medium">
                        Fabric Palette: <span className="text-white font-bold">{selectedColor || 'Select'}</span>
                      </span>
                    </div>
                    <div className="flex gap-2.5 flex-wrap">
                      {product.colors.map((color: string) => (
                        <button
                          key={color}
                          onClick={() => { setSelectedColor(color); triggerHaptic('light'); }}
                          className={`px-4 py-2 rounded-full border text-[10px] uppercase tracking-[0.18em] font-medium transition-all duration-200 ${
                            selectedColor === color
                              ? 'border-white bg-white text-black shadow-lg scale-105'
                              : 'border-white/15 bg-white/[0.02] text-white/50 hover:border-white/30 hover:text-white'
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
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-medium">
                        Atelier Fit: <span className="text-white font-bold">{selectedSize || 'Select'}</span>
                      </span>
                      <button
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-[10px] uppercase tracking-[0.18em] text-white/50 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <span>Size Guide</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(product.sizes?.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL'])
                        .map((size: string) => (
                          <button
                            key={size}
                            onClick={() => { setSelectedSize(size); triggerHaptic('light'); }}
                            className={`min-w-12 h-11 px-3 rounded-full border font-mono text-xs uppercase tracking-wider transition-all duration-200 ${
                              selectedSize === size
                                ? 'border-white bg-white text-black shadow-lg scale-105 font-bold'
                                : 'border-white/15 bg-white/[0.02] text-white/60 hover:border-white/40 hover:text-white'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                    </div>
                    {!selectedSize && !product.isUnstitched && (
                      <p className="text-[10px] text-white/40 mt-2 flex items-center gap-1 uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3" /> Select a silhouette size
                      </p>
                    )}
                  </div>
                )}

                {/* Quantity */}
                {!isOutOfStock && (
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-medium">Quantity</span>
                    <div className="flex items-center border border-white/15 bg-white/[0.02] rounded-full overflow-hidden">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 text-base"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-xs font-mono text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                        disabled={quantity >= product.stock}
                        className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 text-base"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Primary CTA ───────────────────────────────────────── */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`relative w-full py-4.5 rounded-full font-bold uppercase text-xs tracking-[0.25em] transition-all duration-300 mb-3 shadow-2xl flex items-center justify-center gap-2.5 ${
                  isOutOfStock
                    ? 'bg-white/10 text-white/30 cursor-not-allowed border border-white/10'
                    : 'bg-white text-black hover:bg-white/90 hover:scale-[1.01]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock ? 'Sold Out' : `Add to Bag • ${formatCurrency(product.price * quantity)}`}
              </button>

              {/* ── Secondary CTAs Row ────────────────────────────────── */}
              <div className="flex gap-2.5 mb-6">
                <button
                  onClick={handleWishlistToggle}
                  className={`flex-1 py-3.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 ${
                    isWished
                      ? 'border-white bg-white text-black'
                      : 'border-white/15 bg-white/[0.02] text-white/60 hover:border-white/40 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-black' : ''}`} />
                  {isWished ? 'Saved to Wishlist' : 'Add to Wishlist'}
                </button>
                <button
                  onClick={handleShare}
                  className="px-5 py-3.5 rounded-full border border-white/15 bg-white/[0.02] text-white/60 hover:border-white/40 hover:text-white transition-all duration-300 flex items-center justify-center"
                  aria-label="Share silhouette"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* ── Trust Badges ──────────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-2 mb-8">
                {[
                  { icon: <Banknote className="w-4 h-4 text-white" />, label: 'Cash on Delivery', sub: 'Nationwide' },
                  { icon: <Truck className="w-4 h-4 text-white" />, label: 'Express Delivery', sub: 'DHL / TCS Express' },
                  { icon: <RotateCcw className="w-4 h-4 text-white" />, label: 'Atelier Exchange', sub: 'Hassle-free policy' },
                  { icon: <ShieldCheck className="w-4 h-4 text-white" />, label: '100% Authentic', sub: 'Verified original' },
                ].map(({ icon, label, sub }) => (
                  <div key={label}
                    className="flex items-center gap-3 bg-[#0a0a0a] border border-white/5 rounded-sm p-3 hover:border-white/15 transition-colors"
                  >
                    {icon}
                    <div>
                      <p className="text-[10px] text-white font-medium tracking-wide">{label}</p>
                      <p className="text-[9px] text-white/40">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Tabs: Description / Reviews / Care ────────────────── */}
              <div className="border-t border-white/10">
                <div className="flex gap-0 border-b border-white/10 mb-6 mt-4">
                  {(['description', 'care'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 pb-3 text-[10px] uppercase tracking-widest font-bold transition-all duration-200 relative ${
                        activeTab === tab
                          ? 'text-white'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {tab === 'description' ? 'Atelier Notes' : 'Care & Maintenance'}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
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
                      className="text-white/60 text-xs md:text-sm leading-relaxed font-sans mb-6"
                    >
                      {product.description || 'Premium bespoke silhouette from WEARITION\'s curated collection. Handcrafted by master artisans with intricate detail and precision tailoring.'}
                    </motion.div>
                  )}


                  {activeTab === 'care' && (
                    <motion.div
                      key="care"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-6 space-y-2"
                    >
                      {[
                        { title: 'Dry Clean Only', detail: 'Professional couture dry cleaning recommended to protect fine silks and embroidery.' },
                        { title: 'Preservation Storage', detail: 'Store in complimentary breathable garment bag away from direct heat.' },
                        { title: 'Low Heat Steaming', detail: 'Steam inside out on low temperature setting.' },
                      ].map(({ title, detail }) => (
                        <div key={title} className="p-3 bg-[#0a0a0a] border border-white/5 rounded-sm">
                          <p className="text-[10px] text-white font-semibold uppercase tracking-wider">{title}</p>
                          <p className="text-[11px] text-white/50 font-sans mt-0.5">{detail}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── WhatsApp Styling Concierge ────────────────────────── */}
              <a 
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full border border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05] text-[10px] uppercase tracking-[0.2em] font-semibold text-white/80 hover:text-white transition-all text-center flex items-center justify-center gap-2 mb-6"
              >
                <span>Speak with an Atelier Stylist ↗</span>
              </a>

              {/* ── Shipping Note ─────────────────────────────────────────── */}
              <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] text-center mb-4">
                Nationwide Delivery Across Pakistan · Rs. 250 Shipping · Free Over Rs. 10,000
              </p>

            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

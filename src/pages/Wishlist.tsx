import { useEffect, useState } from 'react';
import { useWishlistStore } from '../store/wishlistStore';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ProductCard } from '../components/shop/ProductCard';
import { Link } from 'react-router-dom';

export function Wishlist() {
  const { wishlistIds } = useWishlistStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const fetchedProducts = [];
        const dummyProducts = [
              { id: '1', title: 'Noir Silk Dress', price: 595, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1595777457583-95e059f581ce?q=80&w=800&auto=format&fit=crop'] },
              { id: '2', title: 'Cashmere Turtleneck', price: 350, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=800&auto=format&fit=crop'] },
              { id: '3', title: 'Tailored Wool Coat', price: 950, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1544022613-e87ca7cebb6c?q=80&w=800&auto=format&fit=crop'] },
              { id: '4', title: 'Wide Leg Trousers', price: 290, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop'] },
              { id: '5', title: 'Oversized Silk Blouse', price: 320, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1434389678232-06b2a30336fc?q=80&w=800&auto=format&fit=crop'] },
              { id: '6', title: 'Leather Mini Skirt', price: 450, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1582142306909-195724d33ffc?q=80&w=800&auto=format&fit=crop'] },
              { id: '7', title: 'Structured Blazer', price: 680, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=800&auto=format&fit=crop'] },
              { id: '8', title: 'Minimalist Chelsea Boot', price: 590, category: 'shoes', images: ['https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=800&auto=format&fit=crop'] },
        ];
        
        for (const id of wishlistIds) {
          const docSnap = await getDoc(doc(db, "products", id));
          if (docSnap.exists()) {
            fetchedProducts.push({ id: docSnap.id, ...docSnap.data() });
          } else {
            const dummy = dummyProducts.find(p => p.id === id);
            if (dummy) fetchedProducts.push(dummy);
          }
        }
        setProducts(fetchedProducts);
      } catch (e) {
        console.error("Failed to fetch wishlist products", e);
      } finally {
         setLoading(false);
      }
    }
    fetchWishlistProducts();
  }, [wishlistIds]);

  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <header className="mb-20 text-center">
          <h1 className="font-serif text-[4rem] leading-none tracking-tight text-foreground mb-6">Your Wishlist</h1>
          <p className="text-foreground/60 text-sm max-w-xl mx-auto font-sans">
            {wishlistIds.length} items saved
          </p>
        </header>

        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-t border-foreground rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
           <div className="text-center text-foreground/40 pt-12">
              <p className="uppercase text-xs tracking-widest mb-8">Your wishlist is empty</p>
              <Link to="/shop" className="inline-block bg-foreground text-background px-10 py-5 uppercase text-xs tracking-[0.2em] font-medium hover:bg-accent transition-colors">
                 Continue Shopping
              </Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

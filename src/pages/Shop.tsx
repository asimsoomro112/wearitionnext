import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/shop/ProductCard';

export function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchString = searchParams.get('search')?.toLowerCase() || '';
  const categoryFilter = searchParams.get('category')?.toLowerCase() || '';

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(
          collection(db, "products"),
          where("isPublished", "==", true),
        );
        const querySnapshot = await getDocs(q);
        let fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        
        if (fetched.length > 0) {
           // We have real data
        } else {
           // Default placeholder data if DB is empty
           fetched = [
              { id: '1', title: 'Noir Silk Dress', price: 595, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1595777457583-95e059f581ce?q=80&w=800&auto=format&fit=crop'] },
              { id: '2', title: 'Cashmere Turtleneck', price: 350, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=800&auto=format&fit=crop'] },
              { id: '3', title: 'Tailored Wool Coat', price: 950, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1544022613-e87ca7cebb6c?q=80&w=800&auto=format&fit=crop'] },
              { id: '4', title: 'Wide Leg Trousers', price: 290, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop'] },
              { id: '5', title: 'Oversized Silk Blouse', price: 320, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1434389678232-06b2a30336fc?q=80&w=800&auto=format&fit=crop'] },
              { id: '6', title: 'Leather Mini Skirt', price: 450, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1582142306909-195724d33ffc?q=80&w=800&auto=format&fit=crop'] },
              { id: '7', title: 'Structured Blazer', price: 680, category: 'ready-to-wear', images: ['https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=800&auto=format&fit=crop'] },
              { id: '8', title: 'Minimalist Chelsea Boot', price: 590, category: 'shoes', images: ['https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=800&auto=format&fit=crop'] },
           ];
        }

        if (searchString) {
          fetched = fetched.filter(p => p.title.toLowerCase().includes(searchString) || (p.description && p.description.toLowerCase().includes(searchString)));
        }

        if (categoryFilter) {
          fetched = fetched.filter(p => p.category?.toLowerCase() === categoryFilter);
        }

        setProducts(fetched);
      } catch (e) {
        console.error("Error fetching products", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchString]);

  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background">
      <div className="max-w-[1440px] mx-auto">
        <header className="mb-12 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-[4rem] leading-tight md:leading-none tracking-tight text-foreground mb-6">Explore the Collection</h1>
          <p className="text-foreground/60 text-sm max-w-xl mx-auto font-sans">
            Discover the complete collection of ready-to-wear, accessories, and elevated essentials.
          </p>
        </header>

        {/* Categories Glassmorphism Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          {[
            { name: 'All', value: '' },
            { name: 'Ready-to-Wear', value: 'ready-to-wear' },
            { name: 'Accessories', value: 'accessories' },
            { name: 'Shoes', value: 'shoes' },
            { name: 'Jewelry', value: 'jewelry' },
            { name: 'Bags', value: 'bags' },
            { name: 'Outerwear', value: 'outerwear' },
          ].map((cat) => (
            <Link
              key={cat.name}
              to={cat.value ? `/shop?category=${cat.value}` : '/shop'}
              className={`px-6 py-3 rounded-full backdrop-blur-md border shadow-[0_4px_16px_0_rgba(31,38,135,0.15)] transition-all duration-300 text-xs tracking-widest uppercase font-medium ${
                categoryFilter === cat.value
                  ? 'bg-foreground/10 border-foreground/30 text-foreground scale-105'
                  : 'bg-background/20 border-foreground/10 text-foreground/70 md:hover:bg-foreground/5 md:hover:border-foreground/20'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Filters bar */}
        <div className="flex justify-between items-center border-y border-white/10 py-6 mb-16 text-xs uppercase tracking-[0.2em] text-foreground">
          <div className="flex gap-12">
            <button className="hover:text-accent transition-colors flex items-center gap-2">Category <span className="text-[10px]">▼</span></button>
            <button className="hover:text-accent transition-colors hidden md:flex items-center gap-2">Size <span className="text-[10px]">▼</span></button>
            <button className="hover:text-accent transition-colors hidden md:flex items-center gap-2">Color <span className="text-[10px]">▼</span></button>
          </div>
          <button className="hover:text-accent transition-colors flex items-center gap-2">Sort By: Recommended <span className="text-[10px]">▼</span></button>
        </div>

        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-t border-white rounded-full animate-spin"></div>
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

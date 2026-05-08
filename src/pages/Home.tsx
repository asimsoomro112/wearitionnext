import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { AbstractBackground } from "../components/layout/AbstractBackground";
import { formatCurrency } from "../utils/currency";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import heroImg from "@/1.png";

gsap.registerPlugin(ScrollTrigger);

const CategoryGrid = ({ items }: { items?: any[] }) => (
  <section className="py-12 md:py-24 px-6 lg:px-12 w-full max-w-[1600px] mx-auto z-10 relative bg-background">
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(items || []).map((cat, i) => (
           <Link to={cat.link || `/shop?category=${cat.name?.toLowerCase()}`} key={i} className="group relative aspect-[3/4] overflow-hidden lg:aspect-auto lg:h-[60vh] bg-background-secondary/20 shadow-md block parallax-container">
              <img src={cat.image} alt={cat.name} className="parallax-img absolute inset-x-0 top-[-15%] w-full h-[130%] object-cover transition-transform duration-1000 group-hover:scale-[1.03]" style={{ willChange: "transform" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-8 z-10 pointer-events-none">
                 <h3 className="text-white text-3xl font-serif uppercase tracking-widest group-hover:text-accent transition-colors pointer-events-auto">{cat.name}</h3>
              </div>
           </Link>
        ))}
     </div>
  </section>
);

const HorizontalScroller = ({ title, products, sectionClass, scrollClass, isSale = false }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !containerRef.current || products.length === 0) return;
    
    // GSAP only for Desktop
    const isDesktop = window.innerWidth > 1024;
    
    if (isDesktop) {
      const scrollWidth = containerRef.current.scrollWidth;
      const windowWidth = window.innerWidth;
      const paddingRight = 100;
      
      if (scrollWidth > windowWidth) {
        const ctx = gsap.context(() => {
          gsap.to(containerRef.current, {
            x: -(scrollWidth - windowWidth + paddingRight),
            ease: "none",
            scrollTrigger: {
              trigger: scrollRef.current,
              pin: true,
              scrub: 1,
              start: "center center", 
              end: () => `+=${scrollWidth}`,
              invalidateOnRefresh: true,
            }
          });
        }, scrollRef);
        return () => ctx.revert();
      }
    }
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <section ref={scrollRef} className={`${sectionClass} relative w-full lg:h-screen flex flex-col justify-center overflow-hidden bg-background py-16 lg:py-0`}>
      <div className="w-full max-w-[1440px] mx-auto px-6 relative z-10 mb-8 lg:mb-[8vh]">
        <div className="flex justify-between items-end border-b border-foreground/30 pb-4 mix-blend-difference">
          <h2 className="font-serif text-3xl md:text-5xl lg:text-7xl uppercase tracking-widest text-foreground">
            {title}
          </h2>
          <Link to="/shop" className="text-xs uppercase tracking-widest hover:text-accent transition-colors text-foreground whitespace-nowrap ml-4">
            View All
          </Link>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto lg:overflow-hidden z-10 pl-6 lg:pl-[max(1.5rem,calc((100vw-1440px)/2))] hide-scrollbar touch-pan-x">
        <div ref={containerRef} className={`flex gap-6 md:gap-10 items-center w-max pb-8 pr-[10vw] ${scrollClass}`}>
          {products.map((product: any, i: number) => (
            <Link to={`/product/${product.id}`} key={i} className="product-card w-[220px] sm:w-[260px] md:w-[350px] group cursor-pointer flex-shrink-0 block">
               <div className="relative aspect-[3/4] overflow-hidden mb-4 md:mb-6 bg-background-secondary/20 shadow-xl parallax-container">
                 <img src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1595777457583-95e059f581ce?q=80&w=800'} alt={product.name} className="parallax-img absolute top-[-10%] left-0 w-full h-[120%] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" style={{ willChange: "transform" }}/>
                 {((product.isOnSale || isSale) && product.salePrice) && (
                   <div className="absolute top-4 left-4 bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 z-10 shadow-lg">Sale</div>
                 )}
                 <div className="absolute inset-0 bg-background-secondary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-20">
                   <button className="bg-foreground text-background px-8 py-3 text-xs uppercase tracking-widest hover:scale-105 transition-transform duration-300">Quick View</button>
                 </div>
               </div>
               <div className="flex justify-between items-start text-foreground">
                 <div>
                   <h3 className="font-serif text-[11px] sm:text-sm tracking-wide uppercase mb-1 truncate max-w-[200px]">{product.title || product.name}</h3>
                   {((product.isOnSale || isSale) && product.salePrice) ? (
                     <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm font-sans">
                       <span className="text-foreground font-medium">{formatCurrency(product.salePrice)}</span>
                       <span className="opacity-50 line-through">{formatCurrency(product.price)}</span>
                     </div>
                   ) : (
                     <p className="opacity-70 text-xs sm:text-sm font-sans">{formatCurrency(product.price)}</p>
                   )}
                 </div>
               </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const defaultSections = [
        { id: '1', type: 'hero' },
        { 
          id: '2', type: 'categories', title: 'Categories',
          items: [
            { name: 'Womens', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop', link: '/shop?category=womens' },
            { name: 'Mens', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop', link: '/shop?category=mens' },
            { name: 'Accessories', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop', link: '/shop?category=accessories' },
            { name: 'Collections', image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=800&auto=format&fit=crop', link: '/shop?category=collections' },
          ]
        },
        { id: '3', type: 'products_scroll', title: 'Trending Now', productQueryType: 'trending' },
        { id: '4', type: 'editorial' },
        { id: '5', type: 'products_scroll', title: 'End of Season Sale', productQueryType: 'sale' },
        { id: '6', type: 'artisanship' },
        { id: '7', type: 'newsletter' },
      ];

      try {
        // Fetch products
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("isPublished", "==", true));
        const productsSnap = await getDocs(q);
        const fetchedProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(fetchedProducts);

        // Fetch layout
        const settingsRef = doc(db, 'settings', 'homepage');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists() && settingsSnap.data().sections) {
          setSections(settingsSnap.data().sections);
        } else {
          setSections(defaultSections);
        }
      } catch (e) {
        // Use fallbacks if firestore is offline or fails
        setSections(defaultSections);
        try {
          handleFirestoreError(e, OperationType.GET, 'homepage');
        } catch (err) {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Use a separate useEffect or timeout to initialize GSAP after sections render
  useEffect(() => {
    if (loading || sections.length === 0) return;

    let ctx = gsap.context(() => {
      // Hero Parallax Elements 3D Effect
      const heroSection = document.querySelector(".hero-section");
      if (heroSection) {
        gsap.to(".parallax-bg", {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(".parallax-foreground", {
          yPercent: -30,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(".parallax-features", {
          yPercent: -50,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(".parallax-badge", {
          yPercent: -70,
          rotation: 45,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Parallax images logic
      const parallaxContainers = gsap.utils.toArray(".parallax-container");
      parallaxContainers.forEach((container: any) => {
        const img = container.querySelector(".parallax-img");
        if (img) {
          gsap.to(img, {
            yPercent: 15, // Move image down smoothly
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom", 
              end: "bottom top", 
              scrub: 1, // Smooth scrub
            },
          });
        }
      });

      // Backgrounds and sections logic
      const bg = document.querySelector(".hero-bg");
      if (bg && containerRef.current) {
        gsap.to(bg, {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      const editorialBg = document.querySelector(".editorial-bg");
      if (editorialBg) {
        gsap.to(editorialBg, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: ".editorial-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      gsap.from(".artisanship-image", {
        scrollTrigger: {
          trigger: ".artisanship-section",
          start: "top center+=100",
          toggleActions: "play none none reverse",
        },
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".artisanship-text > *", {
        scrollTrigger: {
          trigger: ".artisanship-section",
          start: "top center+=100",
          toggleActions: "play none none reverse",
        },
        x: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, sections, products]);

  if (loading) return null;

  const renderSection = (section: any, index: number) => {
    switch(section.type) {
      case 'hero':
        return (
          <section key={section.id || index} className="hero-section relative w-full h-[100dvh] min-h-[650px] md:min-h-[800px] overflow-hidden flex items-center px-5 md:px-[6%] text-white bg-[#0b0d12]">
            {/* The 3D background */}
            <div className="parallax-bg absolute inset-0 z-[1]" style={{
              background: `linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 35%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0.1) 100%), url("${heroImg}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: "scale(1.1)",
              willChange: "transform"
            }}></div>

            <div className="hero-content relative z-[2] max-w-[720px] parallax-foreground pt-4 md:pt-0 pb-20 md:pb-0 scale-[0.85] sm:scale-95 md:scale-100 origin-left">
              <div className="font-['Great_Vibes'] text-[1.8rem] md:text-[2.5rem] text-[#f7e1cf] mb-[8px] md:mb-[10px] opacity-95">
                Made from luxurious material
              </div>
              <div className="leading-[0.9] mb-[20px] md:mb-[28px]">
                <span className="block font-['Anton'] uppercase tracking-[1px] md:tracking-[2px] text-[#f5e7d9] text-[18vw] md:text-[8vw] drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)] whitespace-nowrap">STEP BACK</span>
                <span className="block font-['Anton'] uppercase tracking-[1px] md:tracking-[2px] text-[#f5e7d9] text-[18vw] md:text-[8vw] drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)] md:ml-[160px] whitespace-nowrap">INTO STYLE</span>
              </div>
              <p className="max-w-[420px] md:max-w-[520px] text-[0.9rem] md:text-[1.08rem] leading-[1.6] md:leading-[1.8] text-white/80 mb-[28px] md:mb-[38px] font-['Inter'] pr-4">
                Explore timeless pieces that blend classic elegance with a modern twist.
                Embrace iconic styles and discover your perfect look with premium fashion
                crafted for confidence.
              </p>
              <Link to="/shop" className="inline-flex items-center gap-[10px] md:gap-[14px] px-[32px] md:px-[42px] py-[16px] md:py-[20px] bg-[#d85d20] border-2 border-white/15 rounded-[12px] text-white font-semibold tracking-[0.5px] text-[0.9rem] md:text-[1rem] transition-all duration-300 shadow-[0_10px_35px_rgba(216,93,32,0.35)] hover:-translate-y-1 hover:bg-[#f06f2f] hover:shadow-[0_14px_40px_rgba(240,111,47,0.45)] font-['Inter']">
                SHOP NOW →
              </Link>
            </div>

            <div className="bottom-features absolute bottom-[120px] md:bottom-[90px] left-5 md:left-[6%] z-[2] flex gap-[12px] md:gap-[50px] flex-wrap md:flex-nowrap parallax-features max-w-[80vw] md:max-w-none">
              <div className="flex items-center gap-[8px] md:gap-[14px] text-white font-['Inter']">
                <div className="w-[36px] h-[36px] md:w-[52px] md:h-[52px] rounded-full border border-white/35 flex items-center justify-center text-[0.9rem] md:text-[1.2rem] text-[#ff7b38] backdrop-blur-[6px] shrink-0">★</div>
                <div className="text-[0.75rem] md:text-[0.95rem] leading-[1.2] md:leading-[1.4] text-white/90">PREMIUM <br className="hidden md:block"/> QUALITY</div>
              </div>
              <div className="flex items-center gap-[8px] md:gap-[14px] text-white font-['Inter']">
                <div className="w-[36px] h-[36px] md:w-[52px] md:h-[52px] rounded-full border border-white/35 flex items-center justify-center text-[0.9rem] md:text-[1.2rem] text-[#ff7b38] backdrop-blur-[6px] shrink-0">⌂</div>
                <div className="text-[0.75rem] md:text-[0.95rem] leading-[1.2] md:leading-[1.4] text-white/90">TIMELESS <br className="hidden md:block"/> DESIGN</div>
              </div>
              <div className="flex items-center gap-[8px] md:gap-[14px] text-white font-['Inter']">
                <div className="w-[36px] h-[36px] md:w-[52px] md:h-[52px] rounded-full border border-white/35 flex items-center justify-center text-[0.9rem] md:text-[1.2rem] text-[#ff7b38] backdrop-blur-[6px] shrink-0">✓</div>
                <div className="text-[0.75rem] md:text-[0.95rem] leading-[1.2] md:leading-[1.4] text-white/90">BUILT TO <br className="hidden md:block"/> LAST</div>
              </div>
            </div>

            <div className="badge hidden md:flex absolute right-[6%] md:bottom-[150px] z-[2] w-[140px] h-[140px] rounded-full border-2 border-white/25 items-center justify-center text-center p-[20px] text-white text-[0.85rem] leading-[1.5] bg-white/5 backdrop-blur-[10px] font-['Inter'] parallax-badge">
              CURATED FOR CONFIDENCE<br/>DESIGNED FOR YOU
            </div>

            <div className="hero-bottom-bar absolute bottom-0 left-0 w-full z-[3] bg-[#f2e7dc] text-[#111] px-5 md:px-[6%] py-[14px] md:py-[18px] flex flex-col md:flex-row justify-center items-center text-[0.65rem] sm:text-[0.75rem] md:text-[0.95rem] tracking-[1.5px] md:tracking-[4px] uppercase font-medium font-['Inter'] gap-[6px] md:gap-0 text-center parallax-bottom">
              <div>NEW ARRIVALS • ICONIC LOOKS • EFFORTLESS YOU</div>
            </div>
          </section>
        );

      case 'categories':
        return <CategoryGrid key={section.id || index} items={section.items} />;

      case 'products_scroll':
        let filteredProducts = [...products];
        if (section.productQueryType === 'sale') {
          filteredProducts = filteredProducts.filter(p => p.isOnSale && p.salePrice);
        } else if (section.productQueryType === 'category' && section.categoryValue) {
          filteredProducts = filteredProducts.filter(p => p.category?.toLowerCase() === section.categoryValue?.toLowerCase());
        } else if (section.productQueryType === 'trending') {
           // Provide fallback trending items if store is empty
           if (filteredProducts.length === 0) {
              filteredProducts = [
                { id: "1", name: "Noir Silk Dress", price: 595, image: "https://images.unsplash.com/photo-1595777457583-95e059f581ce?q=80&w=800&auto=format&fit=crop" },
                { id: "3", name: "Tailored Wool Coat", price: 950, image: "https://images.unsplash.com/photo-1544022613-e87ca7cebb6c?q=80&w=800&auto=format&fit=crop" },
                { id: "4", name: "Wide Leg Trousers", price: 290, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop" },
                { id: "6", name: "Leather Mini Skirt", price: 450, image: "https://images.unsplash.com/photo-1582142306909-195724d33ffc?q=80&w=800&auto=format&fit=crop" },
              ];
           }
        }
        
        // Final fallback if category/sale still empty for testing
        if (filteredProducts.length === 0) {
           filteredProducts = [
              { id: "sale1", name: "Oversized Silk Blouse", price: 320, salePrice: 220, image: "https://images.unsplash.com/photo-1434389678232-06b2a30336fc?q=80&w=800&auto=format&fit=crop", isOnSale: true },
              { id: "sale2", name: "Straight Leg Denim", price: 280, salePrice: 180, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop", isOnSale: true },
              { id: "sale3", name: "Silk Camisole", price: 180, salePrice: 120, image: "https://images.unsplash.com/photo-1582041148888-0675ebfa4109?q=80&w=800&auto=format&fit=crop", isOnSale: true },
           ];
        }

        return (
          <HorizontalScroller 
            key={section.id || index}
            title={section.title || ''} 
            products={filteredProducts} 
            sectionClass={`scroll-section-${index}`} 
            isSale={section.productQueryType === 'sale'}
          />
        );

      case 'editorial':
        return (
          <section key={section.id || index} className="editorial-section relative overflow-hidden w-full h-[90vh] flex items-center px-6 lg:px-24 my-16 bg-black parallax-container">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop"
              alt="Editorial"
              className="parallax-img absolute top-[-15%] left-0 w-full h-[130%] object-cover opacity-80"
              style={{ willChange: "transform" }}
            />
            {/* Dark overlay to ensure white text is always visible */}
            <div className="absolute inset-0 bg-black/30 pointer-events-none z-[1]"></div>

            <div className="relative z-[2] w-full max-w-2xl p-8 lg:p-16 bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-2xl rounded-sm">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight text-white drop-shadow-lg">
                The Autumn Edit
              </h2>
              <p className="font-sans leading-relaxed mb-8 text-sm lg:text-base text-white/90 drop-shadow-md">
                Embrace the changing seasons with our latest editorial. Structured
                tailoring meets fluid silks, creating a wardrobe that transitions
                seamlessly from day to evening.
              </p>
              <Link
                to="/editorial"
                className="inline-block uppercase tracking-[0.2em] text-xs border-b border-white pb-1 hover:text-white/70 transition-colors text-white font-medium"
              >
                Read Editorial
              </Link>
            </div>
          </section>
        );

      case 'artisanship':
        return (
          <section key={section.id || index} className="artisanship-section relative z-10 w-full py-20 md:py-32 px-6 md:px-12 bg-background-secondary overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10">
              <img
                src="https://images.unsplash.com/photo-1606011334315-025e4baab810?q=80&w=2000&auto=format&fit=crop"
                alt="Fabric texture"
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
              <div className="w-full lg:w-1/2 artisanship-image">
                <div className="relative aspect-[4/5] overflow-hidden shadow-2xl parallax-container">
                  <img
                    src="https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?q=80&w=1000&auto=format&fit=crop"
                    alt="Artisanship"
                    className="parallax-img absolute top-[-10%] left-0 w-full h-[120%] object-cover hover:scale-[1.02] transition-transform duration-1000 ease-out"
                    style={{ willChange: "transform" }}
                  />
                </div>
              </div>
              <div className="w-full lg:w-1/2 artisanship-text">
                <h2 className="font-serif text-3xl md:text-4xl lg:text-6xl uppercase tracking-widest text-foreground mb-8 lg:mb-12 leading-tight">
                  Uncompromising Artisanship
                </h2>
                <p className="text-foreground/70 font-sans leading-relaxed mb-6 text-sm lg:text-base">
                  Every garment is meticulously crafted in our European ateliers,
                  where generations of expertise meet modern innovation. We believe
                  in the power of the human hand and the poetry of creation.
                </p>
                <p className="text-foreground/70 font-sans leading-relaxed mb-12 text-sm lg:text-base">
                  We source only the finest natural fibers—from Mongolian cashmere
                  to Italian silk—ensuring each piece offers unparalleled comfort,
                  superior drape, and enduring longevity.
                </p>
                <Link
                  to="/about"
                  className="inline-block uppercase text-xs tracking-[0.2em] text-foreground border border-foreground px-10 py-5 hover:bg-foreground hover:text-background transition-colors duration-300"
                >
                  Discover Our Process
                </Link>
              </div>
            </div>
          </section>
        );

      case 'newsletter':
        return (
          <section key={section.id || index} className="newsletter-section relative z-10 w-full py-24 md:py-40 px-6 flex items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0 z-0 opacity-20">
              <img
                src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=2000&auto=format&fit=crop"
                alt="Newsletter background"
                className="w-full h-full object-cover grayscale blur-sm"
              />
              <div className="absolute inset-0 bg-background/80"></div>
            </div>
            <div className="max-w-xl w-full text-center relative z-10">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl uppercase tracking-widest text-foreground mb-6">
                Join the Community
              </h2>
              <p className="text-foreground/60 font-sans mb-12">
                Sign up to receive early access to new collections, exclusive
                editorial content, and the latest news from the Maison.
              </p>
              <form
                className="flex flex-col sm:flex-row border-b border-foreground/30 pb-3 relative"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="bg-transparent border-none outline-none text-foreground flex-grow font-sans placeholder-foreground/30 px-2 py-2"
                  required
                />
                <button
                  type="submit"
                  className="uppercase text-xs tracking-[0.2em] text-foreground hover:text-accent transition-colors ml-4 px-2 py-2 font-medium mt-4 sm:mt-0 text-left sm:text-center"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <div ref={bgRef} className="fixed inset-0 z-[-3] bg-background" />
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
}

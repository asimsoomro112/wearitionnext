"use client";
import { useEffect, useState } from "react";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from "firebase/firestore";
import { SEO } from "../components/layout/SEO";
import { WearitionSpinner } from "../components/layout/WearitionSpinner";
import { HomeHero } from "../components/home/HomeHero";
import { BrandsMarquee } from "../components/home/BrandsMarquee";
import { Bestsellers } from "../components/home/Bestsellers";
import { ParallaxBanner } from "../components/home/ParallaxBanner";
import { Testimonials } from "../components/home/Testimonials";
import { Faq } from "../components/home/Faq";
import { Cta } from "../components/home/Cta";

export function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [heroProducts, setHeroProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const productsRef = collection(db, 'products');
        const [productsSnap, heroSnap] = await Promise.all([
          getDocs(query(productsRef, where("isPublished", "==", true))),
          getDocs(query(productsRef, where("isPublished", "==", true), where("isFeatured", "==", true))),
        ]);

        const fetchedProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(fetchedProducts);

        const fetchedHero = heroSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setHeroProducts(fetchedHero.length > 0 ? fetchedHero : fetchedProducts);
      } catch (e: any) {
        console.error("Firestore Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!isMounted || loading) return <WearitionSpinner />;

  return (
    <div className="w-full relative">
      <SEO />
      <HomeHero products={heroProducts} />
      <BrandsMarquee />
      <Bestsellers products={products} />
      <ParallaxBanner />
      <Testimonials />
      <Faq />
      <Cta />
    </div>
  );
}

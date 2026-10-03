"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { SEO } from "../components/layout/SEO";
import { WearitionSpinner } from "../components/layout/WearitionSpinner";

import HeroSection from "../components/HeroSection/HeroSection";
import { BrandManifesto } from "../components/home/BrandManifesto";
import { SelectedDrops } from "../components/home/SelectedDrops";
import { AtelierDisciplines } from "../components/home/AtelierDisciplines";
import { ParallaxVignette } from "../components/home/ParallaxVignette";
import { FaqSection, FAQS } from "../components/home/FaqSection";
import { GrandCta } from "../components/home/GrandCta";

gsap.registerPlugin(ScrollTrigger);

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
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
        const productsRef = collection(db, "products");
        const [productsSnap, heroSnap] = await Promise.all([
          getDocs(query(productsRef, where("isPublished", "==", true))),
          getDocs(query(productsRef, where("isPublished", "==", true), where("isFeatured", "==", true))),
        ]);

        const fetchedProducts = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(fetchedProducts);

        const fetchedHero = heroSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setHeroProducts(fetchedHero.length > 0 ? fetchedHero : fetchedProducts);
      } catch (e: any) {
        console.error("Firestore Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (loading || !isMounted) return;

    const ctx = gsap.context(() => {
      const parallaxContainers = gsap.utils.toArray(".parallax-container");
      parallaxContainers.forEach((container: any) => {
        const img = container.querySelector(".parallax-img");
        if (img) {
          const pinnedParent = container.closest("section");
          gsap.to(img, {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
              pinnedContainer: pinnedParent && window.innerWidth > 1024 ? pinnedParent : undefined,
            },
          });
        }
      });

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    }, containerRef);

    return () => ctx.revert();
  }, [loading, isMounted]);

  if (!isMounted || loading) return <WearitionSpinner />;

  return (
    <div className="w-full relative bg-[#030303] text-[#fafafa] selection:bg-white selection:text-black" ref={containerRef}>
      <SEO faqs={FAQS} />
      
      {/* ─── XODEX EXACT 9 SECTIONS IN ORDER ───────────────────────────── */}
      {/* [00] Hero: Experience in Motion Runway Showcase */}
      <HeroSection products={heroProducts} />

      {/* [01] About: Creative Atelier & Trusted By Marquee */}
      <BrandManifesto />

      {/* [02] Works: Selected Drops & Case Studies */}
      <SelectedDrops products={products} />

      {/* [03] Services: Our Disciplines with Neon Emerald Dot */}
      <AtelierDisciplines />

      {/* Parallax Vignette: Emotion in Every Silhouette */}
      <ParallaxVignette />


      {/* [05] FAQ: Clear Answers & Interactive Accordion */}
      <FaqSection />

      {/* [06] Grand CTA: let's create SOMETHING timeless */}
      <GrandCta />
    </div>
  );
}
export default Home;
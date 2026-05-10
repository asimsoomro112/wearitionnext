"use client";
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const DEFAULTS = {
  title: 'WEARITION — Luxury Fashion House Pakistan',
  description: 'Premium curated fashion for the modern visionary. Discover luxury menswear & womenswear at WEARITION — Pakistan\'s premier online fashion destination.',
  image: 'https://wearition.store/logo.png',
  url: 'https://wearition.store',
};

export function SEO({ 
  title,
  description = DEFAULTS.description,
  image = DEFAULTS.image,
  url = DEFAULTS.url,
  type = 'website'
}: SEOProps) {
  const fullTitle = title ? `${title} — WEARITION` : DEFAULTS.title;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Meta tags
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('description', description);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', image, true);
    setMeta('og:url', url, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', 'WEARITION', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // JSON-LD Schema
    let script = document.querySelector('#schema-org') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'schema-org';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': type === 'product' ? 'Product' : 'Organization',
      name: fullTitle,
      description,
      image,
      url,
      ...(type !== 'product' && {
        logo: 'https://wearition.store/logo.png',
        sameAs: [
          'https://instagram.com/wearition',
          'https://tiktok.com/@wearition'
        ]
      })
    });

    return () => {
      document.title = DEFAULTS.title;
    };
  }, [fullTitle, description, image, url, type]);

  return null;
}

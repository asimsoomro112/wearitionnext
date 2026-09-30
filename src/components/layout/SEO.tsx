"use client";
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  faqs?: { q: string; a: string }[];
}

const DEFAULTS = {
  title: 'WEARITION — Wear Your Identity | Luxury Fashion Atelier & Designer Resale',
  description: "Pakistan's premier luxury fashion atelier & authenticated designer resale. Discover bespoke bridal couture, hand-embroidered silhouettes, and curated archive pieces from elite design houses.",
  image: 'https://wearition.store/logo.png',
  url: 'https://wearition.store',
  keywords: 'WEARITION, luxury fashion Pakistan, Pakistani designer clothes, bespoke bridal couture, designer resale Pakistan, Faraz Manan, Elan, Sana Safinaz, Maria B, Hussain Rehar, Zara Shahjahan, preloved couture Pakistan, Karachi atelier',
};

export function SEO({ 
  title,
  description = DEFAULTS.description,
  image = DEFAULTS.image,
  url = DEFAULTS.url,
  type = 'website',
  faqs
}: SEOProps) {
  const fullTitle = title ? `${title} — WEARITION` : DEFAULTS.title;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Helper to safely set meta tags
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
    setMeta('keywords', DEFAULTS.keywords);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', image, true);
    setMeta('og:url', url, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', 'WEARITION', true);
    setMeta('og:locale', 'en_US', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // Organization & Website Schema
    let scriptOrg = document.querySelector('#schema-org') as HTMLScriptElement;
    if (!scriptOrg) {
      scriptOrg = document.createElement('script');
      scriptOrg.id = 'schema-org';
      scriptOrg.type = 'application/ld+json';
      document.head.appendChild(scriptOrg);
    }
    
    const schemaOrgData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://wearition.store/#organization',
          name: 'WEARITION',
          url: 'https://wearition.store',
          logo: 'https://wearition.store/logo.png',
          description: description,
          email: 'wearition.80@gmail.com',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Karachi',
            addressCountry: 'PK'
          },
          sameAs: [
            'https://www.instagram.com/_wearition?igsh=eG5obHgydGc3a2Vr',
            'https://www.facebook.com/profile.php?id=61589494648557',
            'https://www.tiktok.com/@wearition3?_r=1&_t=ZS-96Byntwejln'
          ]
        },
        {
          '@type': 'WebSite',
          '@id': 'https://wearition.store/#website',
          url: 'https://wearition.store',
          name: 'WEARITION — Wear Your Identity',
          publisher: {
            '@id': 'https://wearition.store/#organization'
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://wearition.store/shop?search={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        },
        ...(faqs && faqs.length > 0 ? [{
          '@type': 'FAQPage',
          '@id': 'https://wearition.store/#faq',
          mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a
            }
          }))
        }] : [])
      ]
    };

    scriptOrg.textContent = JSON.stringify(schemaOrgData);

    return () => {
      document.title = DEFAULTS.title;
    };
  }, [fullTitle, description, image, url, type, faqs]);

  return null;
}

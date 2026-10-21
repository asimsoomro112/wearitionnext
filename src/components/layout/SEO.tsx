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
  title: 'WEARITION — Wear Your Identity | Branded Suits Online in Pakistan',
  description: "Shop the latest branded suits from Pakistan's top fashion houses — Maria B, Asim Jofa, Hussain Rehar, Baroque and more. New collections with cash on delivery and nationwide shipping.",
  image: 'https://wearition.store/logo.png',
  url: 'https://wearition.store',
  keywords: 'WEARITION, branded suits online Pakistan, lawn suits Pakistan, 3 piece suits online, Maria B suits, Asim Jofa collection, Sana Safinaz, Hussain Rehar, Baroque suits, women\u2019s fashion Pakistan, cash on delivery clothing Pakistan',
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

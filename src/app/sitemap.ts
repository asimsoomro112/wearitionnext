import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Regenerate daily instead of build-only: if the build-time Firestore fetch
// ever fails, the sitemap self-heals within 24h instead of staying empty.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wearition.store';

  // Base static routes
  const staticRoutes = [
    '',
    '/shop',
    '/brands',
    '/about',
    '/contact',
    '/editorial',
    '/sustainability'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic product routes.
  // NOTE: no env-var guard here on purpose — firebase.ts already falls back to a
  // baked-in key, so gating on NEXT_PUBLIC_FIREBASE_API_KEY silently emptied the
  // sitemap whenever the build env lacked that variable. Failures now log loudly.
  const products: MetadataRoute.Sitemap = [];
  try {
    const q = query(collection(db, 'products'), where('isPublished', '==', true));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      products.push({
        url: `${baseUrl}/product/${doc.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    });

    if (products.length === 0) {
      console.error('[sitemap] WARNING: Firestore returned 0 published products — check product data / isPublished flags / Firestore rules.');
    } else {
      console.log(`[sitemap] Generated with ${products.length} product URLs.`);
    }
  } catch (error) {
    console.error('[sitemap] FAILED to fetch products from Firestore:', error);
  }

  return [...staticRoutes, ...products];
}

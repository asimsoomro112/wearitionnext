import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase-admin';

// Regenerate daily instead of build-only: if a generation ever fails, the
// sitemap self-heals within 24h instead of staying empty.
export const revalidate = 86400;

// Product URLs come through the Firebase Admin SDK. Every client-SDK /
// public-key route fails server-side (the web API key's restrictions reject
// non-browser calls), which is why this sitemap shipped with 0 product URLs
// for weeks despite multiple "fixes". The Admin SDK authenticates with the
// service account (FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY on Vercel)
// and is not subject to API-key restrictions.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.wearition.store';

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

  // Dynamic product routes. Failures log loudly — a silent empty sitemap is
  // what hid this bug for weeks.
  const products: MetadataRoute.Sitemap = [];
  try {
    if (!adminDb) {
      console.error('[sitemap] Firebase Admin not initialized — FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY missing from environment. Returning static routes only.');
    } else {
      const snap = await adminDb
        .collection('products')
        .where('isPublished', '==', true)
        .get();

      snap.forEach((doc) => {
        const data = doc.data();
        const updated = data.updatedAt?.toDate?.() ?? data.createdAt?.toDate?.();
        products.push({
          url: `${baseUrl}/product/${doc.id}`,
          lastModified: updated instanceof Date ? updated : new Date(),
          changeFrequency: 'daily',
          priority: 0.9,
        });
      });

      if (products.length === 0) {
        console.error('[sitemap] WARNING: Firestore returned 0 published products — check product data / isPublished flags.');
      } else {
        console.log(`[sitemap] Generated with ${products.length} product URLs.`);
      }
    }
  } catch (error) {
    console.error('[sitemap] FAILED to fetch products from Firestore:', error);
  }

  return [...staticRoutes, ...products];
}

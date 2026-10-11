import { MetadataRoute } from 'next';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase';

// Regenerate daily instead of build-only: if a generation ever fails, the
// sitemap self-heals within 24h instead of staying empty.
export const revalidate = 86400;

// Dedicated server-side Firestore instance.
//
// The shared `db` from @/lib/firebase is initialized with
// experimentalForceLongPolling (needed for client-side networks where
// WebChannel is blocked). That transport hangs/throws inside Node.js, which
// is exactly why the sitemap silently shipped with 0 product URLs. A separate
// named app + default transport is reliable for server-side fetches.
function getServerDb() {
  const serverApp = initializeApp(firebaseConfig, 'sitemap-server');
  return initializeFirestore(serverApp, {});
}

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

  // Dynamic product routes. Failures log loudly — a silent empty sitemap is
  // what hid this bug for weeks.
  const products: MetadataRoute.Sitemap = [];
  try {
    const serverDb = getServerDb();
    const q = query(collection(serverDb, 'products'), where('isPublished', '==', true));
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

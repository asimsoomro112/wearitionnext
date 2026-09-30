import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wearition.store'; // Replace with your actual domain

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

  // Dynamic product routes — Firebase is imported lazily so a missing or
  // invalid config degrades to static routes instead of crashing the build.
  const products: MetadataRoute.Sitemap = [];
  try {
    const { db } = await import('@/lib/firebase');
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const q = query(collection(db, 'products'), where('isPublished', '==', true));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Prefer the product's own timestamps so Google sees real freshness.
      const lastModified =
        data.updatedAt?.toDate?.() ?? data.createdAt?.toDate?.() ?? new Date();
      products.push({
        url: `${baseUrl}/product/${doc.id}`,
        lastModified,
        changeFrequency: 'daily',
        priority: 0.9,
      });
    });
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
  }

  return [...staticRoutes, ...products];
}

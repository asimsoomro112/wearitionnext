import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

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

  // Dynamic product routes
  const products: MetadataRoute.Sitemap = [];
  try {
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
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
    }
  } catch (error) {
    console.error("Warning: Could not generate dynamic product sitemap during build:", error);
  }

  return [...staticRoutes, ...products];
}

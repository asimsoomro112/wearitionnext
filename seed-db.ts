import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin
if (!admin.apps?.length) {
  try {
    admin.initializeApp({
      projectId: 'wearition-d14b5'
    });
  } catch (e) {
    console.error("Firebase Admin initialization failed:", e);
    process.exit(1);
  }
}

const db = admin.firestore();

const DEFAULT_SECTIONS = [
  { id: '1', type: 'hero' },
  { 
    id: '2', type: 'categories', title: 'Categories',
    items: [
      { name: 'Womens', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop', link: '/shop?category=womens' },
      { name: 'Mens', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop', link: '/shop?category=mens' },
      { name: 'Accessories', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop', link: '/shop?category=accessories' },
      { name: 'Collections', image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=800&auto=format&fit=crop', link: '/shop?category=collections' },
    ]
  },
  { id: '3', type: 'products_scroll', title: 'Trending Now', productQueryType: 'trending' },
  { id: '4', type: 'editorial' },
  { id: '5', type: 'products_scroll', title: 'End of Season Sale', productQueryType: 'sale' },
  { id: '6', type: 'artisanship' },
  { id: '7', type: 'newsletter' },
];

const SAMPLE_PRODUCTS = [
  {
    title: "Noir Silk Dress",
    brand: "WEARITION",
    description: "A timeless masterpiece crafted from the finest Italian silk. Perfect for gala evenings and high-profile events.",
    price: 595,
    stock: 12,
    sizes: ["XS", "S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1595777457583-95e059f581ce?q=80&w=800"],
    category: "womens",
    isPublished: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Cashmere Overcoat",
    brand: "WEARITION",
    description: "Exceptional warmth meets tailored precision. Hand-finished seams and premium Mongolian cashmere.",
    price: 1250,
    stock: 8,
    sizes: ["S", "M", "L", "XL"],
    images: ["https://images.unsplash.com/photo-1544022613-e87ca7cebb6c?q=80&w=800"],
    category: "mens",
    isPublished: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Classic Leather Tote",
    brand: "WEARITION",
    description: "Supple full-grain leather with gold-tone hardware. The ultimate companion for the modern professional.",
    price: 450,
    stock: 15,
    sizes: ["One Size"],
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"],
    category: "accessories",
    isPublished: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Silk Patterned Scarf",
    brand: "WEARITION",
    description: "Hand-rolled edges and intricate geometric patterns. A touch of elegance for any ensemble.",
    price: 185,
    stock: 30,
    sizes: ["One Size"],
    images: ["https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=800"],
    category: "accessories",
    isPublished: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seed() {
  console.log("Seeding database...");

  try {
    // 1. Set Homepage Layout
    await db.collection('settings').doc('homepage').set({ sections: DEFAULT_SECTIONS });
    console.log("✓ Homepage layout seeded.");

    // 2. Add Sample Products
    const productsCol = db.collection('products');
    const existingProducts = await productsCol.limit(1).get();
    
    if (existingProducts.empty) {
      for (const product of SAMPLE_PRODUCTS) {
        await productsCol.add(product);
      }
      console.log(`✓ ${SAMPLE_PRODUCTS.length} sample products added.`);
    } else {
      console.log("! Products already exist, skipping product seeding.");
    }

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seed();

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp, 
  writeBatch 
} from "firebase/firestore";

const firebaseConfig = {
  projectId: "wearition-d14b5",
  appId: "1:460215017837:web:e1fb657d03c9b05c163a64",
  apiKey: "AIzaSyC9XCjfyFuyoYh01xOyufrKE2vkKGiC0EM",
  authDomain: "wearition-d14b5.firebaseapp.com",
  storageBucket: "wearition-d14b5.firebasestorage.app",
  messagingSenderId: "460215017837",
  measurementId: "G-JHWT4XCMGK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TRENDING_SECTIONS = [
  { id: '1', type: 'hero' },
  { 
    id: '2', type: 'categories', title: 'The 2026 Collections',
    items: [
      { name: 'Womenswear', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800', link: '/shop?category=women' },
      { name: 'Menswear', image: 'https://images.unsplash.com/photo-1550246140-5119ae4790b7?q=80&w=800', link: '/shop?category=men' },
      { name: 'Tech-Noir', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800', link: '/shop?category=tech-noir' },
      { name: 'Quiet Luxury', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800', link: '/shop?category=quiet-luxury' },
    ]
  },
  { id: '3', type: 'products_scroll', title: 'Featured Menswear', productQueryType: 'category', categoryValue: 'men' },
  { id: '4', type: 'editorial' },
  { id: '5', type: 'products_scroll', title: 'Featured Womenswear', productQueryType: 'category', categoryValue: 'women' },
  { id: '6', type: 'artisanship' },
  { id: '7', type: 'newsletter' },
];

const LUXURY_PRODUCTS = [
  // WOMEN
  {
    title: "Sculpted Silk Gown",
    brand: "WEARITION",
    description: "Architectural precision meets fluid silk. A 2026 signature silhouette.",
    price: 850,
    stock: 12,
    sizes: ["XS", "S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1539008835657-9e8e9680fe0a?q=80&w=800"],
    category: "women",
    isPublished: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Double-Faced Cashmere Blazer",
    brand: "WEARITION",
    description: "The essence of quiet luxury. Hand-stitched finishing and ultra-soft feel.",
    price: 1200,
    stock: 8,
    sizes: ["S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1591360236480-4ed861025a18?q=80&w=800"],
    category: "women",
    isPublished: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "High-Rise Pleated Trousers",
    brand: "WEARITION",
    description: "Sharp tailoring for the modern professional. Sustainable wool crepe.",
    price: 450,
    stock: 15,
    sizes: ["XS", "S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800"],
    category: "women",
    isPublished: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },

  // MEN
  {
    title: "Tech-Noir Utility Overcoat",
    brand: "WEARITION",
    description: "Water-repellent nylon with modular magnetic systems. Future-functional.",
    price: 950,
    stock: 10,
    sizes: ["S", "M", "L", "XL"],
    images: ["https://images.unsplash.com/photo-1550246140-5119ae4790b7?q=80&w=800"],
    category: "men",
    isPublished: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Architectural Wool Suit",
    brand: "WEARITION",
    description: "Sharp shoulders and a streamlined cut. Virgin wool with silk lining.",
    price: 1500,
    stock: 5,
    sizes: ["M", "L", "XL"],
    images: ["https://images.unsplash.com/photo-1536766768598-e09213fdcf22?q=80&w=800"],
    category: "men",
    isPublished: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Seamless Merino Knit",
    brand: "WEARITION",
    description: "3D-knitted for ultimate comfort. Zero waste construction.",
    price: 290,
    stock: 20,
    sizes: ["S", "M", "L", "XL"],
    images: ["https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=800"],
    category: "men",
    isPublished: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Minimalist Leather Sneaker",
    brand: "WEARITION",
    description: "Clean lines and premium calfskin. Handmade in Italy.",
    price: 395,
    stock: 18,
    sizes: ["40", "41", "42", "43", "44"],
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800"],
    category: "men",
    isPublished: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function reseed() {
  console.log("🚀 Starting Client-Side Reseed (Luxury 2026)...");

  try {
    // 1. Clear products
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    console.log(`🗑️ Deleting ${snapshot.size} products...`);
    
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'products', docSnap.id));
    }
    console.log("✓ Products cleared.");

    // 2. Set Homepage
    await setDoc(doc(db, 'settings', 'homepage'), { sections: TRENDING_SECTIONS });
    console.log("✓ Homepage layout updated.");

    // 3. Add Products
    console.log("📦 Adding new collection...");
    for (const product of LUXURY_PRODUCTS) {
      await addDoc(productsCol, product);
    }
    console.log(`✓ ${LUXURY_PRODUCTS.length} products added.`);

    console.log("✨ Seeding successful!");
  } catch (e) {
    console.error("❌ Error:", e);
  } finally {
    process.exit(0);
  }
}

reseed();

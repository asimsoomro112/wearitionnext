import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";

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
  }
];

export default function Seeder() {
  const [status, setStatus] = useState('Idle');

  const runSeeder = async () => {
    setStatus('Seeding...');
    try {
      // 1. Clear products
      const productsCol = collection(db, 'products');
      const snapshot = await getDocs(productsCol);
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, 'products', docSnap.id));
      }
      
      // 2. Set Homepage
      await setDoc(doc(db, 'settings', 'homepage'), { sections: TRENDING_SECTIONS });
      
      // 3. Add Products
      for (const product of LUXURY_PRODUCTS) {
        await addDoc(productsCol, product);
      }
      setStatus('Success! All products updated.');
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div className="pt-40 px-10">
      <h1 className="text-4xl mb-10">Database Seeder</h1>
      <button 
        onClick={runSeeder}
        className="bg-accent text-white px-10 py-5 rounded-full"
      >
        Reseed Database (Luxury 2026)
      </button>
      <p className="mt-10 text-xl">{status}</p>
    </div>
  );
}

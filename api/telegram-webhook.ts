import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (e) {
    console.error("Firebase Admin init failed:", e);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const message = req.body.message;
    if (!message || !message.text) return res.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text;

    if (text.includes('|') && db) {
      const parts = text.split('|').map((s: string) => s.trim());
      if (parts.length >= 3) {
        const newProduct = {
          title: parts[0],
          price: parseFloat(parts[1]),
          description: parts[2],
          images: ["https://images.unsplash.com/photo-1595777457583-95e059f581ce?q=80&w=800"],
          variants: [],
          category: parts[5] || 'Uncategorized',
          brand: 'WEARITION',
          tags: [],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isPublished: true
        };

        await db.collection('products').add(newProduct);
        
        if (process.env.TELEGRAM_BOT_TOKEN) {
          await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: `Product '${parts[0]}' uploaded successfully to WEARITION!`
          }).catch(() => {});
        }
      }
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import axios from 'axios';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin lazily to prevent crashing if config is missing
let adminDb: admin.firestore.Firestore;
try {
  admin.initializeApp(); // Assuming default ADC or env vars for now, standard for AI Studio
  adminDb = admin.firestore();
} catch (e) {
  console.log("Firebase Admin not configured yet.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Telegram Bot Webhook Endpoint
  app.post('/api/telegram-webhook', async (req, res) => {
    try {
      const message = req.body.message;
      if (!message || !message.text) return res.json({ ok: true });

      const chatId = message.chat.id;
      const text = message.text;

      // Extract details assuming format: "Title | Price | Description | Sizes | Colors | Category"
      if (text.includes('|') && adminDb) {
        const parts = text.split('|').map((s: string) => s.trim());
        if (parts.length >= 3) {
          const newProduct = {
            title: parts[0],
            price: parseFloat(parts[1]),
            description: parts[2],
            images: ["https://images.unsplash.com/photo-1595777457583-95e059f581ce?q=80&w=800"], // Placeholder, ImgBB integration goes here
            variants: [],
            category: parts[5] || 'Uncategorized',
            brand: 'WEARITION',
            tags: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            isPublished: true
          };

          await adminDb.collection('products').add(newProduct);
          
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
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'WEARITION' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // @ts-ignore
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WEARITION Server running on http://localhost:${PORT}`);
  });
}

startServer();

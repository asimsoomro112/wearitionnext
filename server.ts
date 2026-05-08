import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import axios from 'axios';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Initialize Firebase Admin lazily to prevent crashing if config is missing
let adminDb: admin.firestore.Firestore;
try {
  admin.initializeApp(); // Assuming default ADC or env vars for now, standard for AI Studio
  adminDb = admin.firestore();
} catch (e) {
  console.log("Firebase Admin not configured yet.");
}

// ────────────── Gmail SMTP Transporter ──────────────
// Uses your Gmail directly — FREE and UNLIMITED (500/day)
// Requires: GMAIL_USER and GMAIL_APP_PASSWORD in .env
const createMailTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  
  if (!user || !pass) {
    console.warn('[Email] GMAIL_USER or GMAIL_APP_PASSWORD not set. Email sending disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' })); // Allow large HTML emails

  // ────────────── EMAIL API ENDPOINT ──────────────
  // POST /api/send-email
  // Body: { to, subject, html }
  // Sends email through YOUR Gmail — free, unlimited, professional
  app.post('/api/send-email', async (req, res) => {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    const transporter = createMailTransporter();
    if (!transporter) {
      console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
      return res.json({ ok: true, mock: true, message: 'Gmail not configured, email logged to console' });
    }

    try {
      const info = await transporter.sendMail({
        from: `"WEARITION" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`[Email] ✓ Sent to ${to} — MessageId: ${info.messageId}`);
      res.json({ ok: true, messageId: info.messageId });
    } catch (error: any) {
      console.error('[Email] ✗ Failed:', error.message);
      res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
  });

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

import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

/**
 * Vercel Serverless Function — Send Email via Gmail SMTP
 * 
 * POST /api/send-email
 * Body: { to, subject, html }
 * 
 * Sends branded emails through YOUR Gmail — free, unlimited (500/day).
 * Works perfectly on Vercel's free hobby plan.
 * 
 * Required Environment Variables (set in Vercel Dashboard):
 *   GMAIL_USER=your-email@gmail.com
 *   GMAIL_APP_PASSWORD=abcdefghijklmnop
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return res.status(200).json({ 
      ok: true, 
      mock: true, 
      message: 'Gmail not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel Environment Variables.' 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"WEARITION" <${gmailUser}>`,
      to,
      subject,
      html,
    });

    console.log(`[Email] ✓ Sent to ${to} — MessageId: ${info.messageId}`);
    return res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('[Email] ✗ Failed:', error.message);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}

// WEARITION — Server-only Gmail SMTP sender (shared by the API routes).
// The transporter is created once per warm instance. When the credentials
// are missing, sending reports false and the caller answers 503 — it never
// pretends the mail went out (the old /api/send-email "mock: true" did).

import nodemailer from 'nodemailer';

let cached: nodemailer.Transporter | null = null;

export function isMailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function getTransporter(): nodemailer.Transporter | null {
  if (!isMailConfigured()) return null;
  if (!cached) {
    cached = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER as string,
        pass: process.env.GMAIL_APP_PASSWORD as string,
      },
    });
  }
  return cached;
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;
  try {
    await transporter.sendMail({
      from: `"WEARITION" <${process.env.GMAIL_USER as string}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (error) {
    console.error('[mailer] send failed:', error);
    return false;
  }
}

/** Escape untrusted text before it is interpolated into an email's HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

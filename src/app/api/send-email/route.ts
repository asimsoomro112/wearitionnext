import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * WEARITION — Email Delivery API
 * Handles secure SMTP sending via Gmail
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    // Fallback/Mock mode if credentials are missing
    if (!user || !pass) {
      console.warn('[Email API] GMAIL_USER or GMAIL_APP_PASSWORD not set in environment.');
      return NextResponse.json({ 
        success: true, 
        mock: true,
        message: 'Email logged to server console (Credentials missing)' 
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    const mailOptions = {
      from: `"WEARITION" <${user}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Email API] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { clientIp, rateLimit } from '@/lib/rateLimit';

/**
 * WEARITION — Style Assistant API (server-side Gemini proxy).
 *
 * The old flow called Google's Generative Language API straight from
 * the browser with the API key in the URL query string
 * (`NEXT_PUBLIC_GEMINI_API_KEY`) — the key shipped in the client bundle
 * and in every request URL, so anyone could extract it and run up
 * charges on the owner's key. The GoogleGenerativeAI SDK import was
 * dead code on top (the component used raw fetch).
 *
 * Now the key lives only in the server env (GEMINI_API_KEY, never
 * NEXT_PUBLIC_), sent to Google in the x-goog-api-key header — never
 * in a URL — and the system prompt lives here too. Rate-limited
 * 30/hour per IP. The client only posts the conversation; the reply
 * text comes back for the client to parse ([SEARCH:] keywords, product
 * search) as before.
 */

const SYSTEM_PROMPT = `You are a luxury personal stylist for WEARITION, a high-end Pakistani fashion brand. You help customers find perfect outfits.
Your personality: elegant, knowledgeable, warm but sophisticated — like a Harrods personal shopper.
When the user describes what they're looking for, extract key intent keywords like category (men/women/shirts/pants), occasion, style, and price range.
Always respond in 2-3 sentences max, then end with: [SEARCH: keyword1,keyword2] so the system can find matching products.
Example: "For a winter gala, I'd recommend our architectural wool pieces. [SEARCH: women,coats,luxury]"
If user greets, introduce yourself briefly. Keep responses warm and luxury-toned. Never mention prices unless asked.`;

const MAX_MESSAGES = 20;
const MAX_CONTENT_CHARS = 1000;
const MODEL = 'gemini-2.5-flash';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function isValidMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const msg = value as Record<string, unknown>;
  if (msg.role !== 'user' && msg.role !== 'assistant') return false;
  if (
    typeof msg.content !== 'string' ||
    !msg.content.trim() ||
    msg.content.length > MAX_CONTENT_CHARS
  ) {
    return false;
  }
  return true;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Style assistant is unavailable right now' },
        { status: 503 },
      );
    }

    const body: unknown = await req.json().catch(() => null);
    const record = (body ?? {}) as Record<string, unknown>;
    const messagesRaw = record.messages;

    if (
      !Array.isArray(messagesRaw) ||
      messagesRaw.length === 0 ||
      messagesRaw.length > MAX_MESSAGES ||
      !messagesRaw.every(isValidMessage)
    ) {
      return NextResponse.json(
        { error: 'Invalid conversation' },
        { status: 400 },
      );
    }
    const messages = messagesRaw as ChatMessage[];

    const ip = clientIp(req);
    const limited = rateLimit(`style-assistant:ip:${ip}`, 30, 60 * 60 * 1000);
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(limited.retryAfterMs / 1000)) },
        },
      );
    }

    // 10s upstream timeout — stays inside Vercel's function limits.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let upstream: Response;
    try {
      upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: messages.map((m) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }],
            })),
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          }),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      console.error('[style-assistant] Gemini upstream error:', upstream.status);
      return NextResponse.json(
        { error: 'The stylist is unavailable right now' },
        { status: 502 },
      );
    }

    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      return NextResponse.json(
        { error: 'The stylist is unavailable right now' },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error('[style-assistant] Error:', error);
    return NextResponse.json(
      { error: 'The stylist is unavailable right now' },
      { status: 500 },
    );
  }
}

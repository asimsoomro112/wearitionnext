import type { NextConfig } from "next";

// Security headers (audit 2026-11-23, sp-security-audit points 16 + config
// hygiene). Applied to every route via next.config headers() — the proxy
// (src/proxy.ts) stays narrow and only handles the X-Robots-Tag rule.
//
// CSP allowlist, enumerated from the code (not guessed):
//  - scripts: self + 'unsafe-inline' (Next.js inline bootstrap scripts)
//  - styles: self + 'unsafe-inline' (framer-motion injects <style> at runtime)
//  - images: self + Cloudinary (product/payment images) + Unsplash
//    (remotePatterns) + data:/blob: (upload previews, inline SVG)
//  - fonts: self-hosted woff2 under _next/static
//  - connect: Firebase SDK (*.googleapis.com — Firestore/Auth/Installations,
//    *.firebaseio.com — realtime listeners) + EmailJS fallback.
//    (The Style Assistant calls Gemini through the server-side
//    /api/style-assistant proxy, so the browser never contacts Google's
//    Generative Language API directly — no host for it here.)
//  - no frames, no plugins, forms post to self only.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://api.emailjs.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'Content-Security-Policy', value: CSP },
];

const nextConfig: NextConfig = {
  // The sustainability page was removed 2026-10-22 (its reselling story did
  // not match the store's actual model — new branded suits via a retailer).
  // Send its old URL to About instead of a dead end.
  async redirects() {
    return [
      { source: '/sustainability', destination: '/about', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;

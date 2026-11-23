// WEARITION — Server-side Firebase ID-token verification for API routes.
// Admin = the union of the client admin list (src/config/admin.ts) and the
// Firestore rules admin list — the two agree today; the union keeps every
// currently-working admin flow working while the routes gain auth.
// (Ahmed owns the admin list; unifying the two sources is a follow-up.)

import { adminAuth } from '@/lib/firebase-admin';
import { ADMIN_EMAILS } from '@/config/admin';

const RULES_ADMIN_EMAILS = [
  'admin@wearition.com',
  'ahmediqbal2003f9@gmail.com',
  'wearition.80@gmail.com',
];

export const ALL_ADMIN_EMAILS: ReadonlySet<string> = new Set(
  [...ADMIN_EMAILS, ...RULES_ADMIN_EMAILS].map((e) => e.toLowerCase()),
);

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ALL_ADMIN_EMAILS.has(email.toLowerCase());
}

function bearerToken(req: Request): string | null {
  const header = req.headers.get('authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

/** Any valid Firebase ID token (not necessarily admin). */
export async function verifyIdToken(
  req: Request,
): Promise<{ uid: string; email: string } | null> {
  const token = bearerToken(req);
  if (!token || !adminAuth) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid, email: (decoded.email || '').toLowerCase() };
  } catch {
    return null;
  }
}

/** A valid ID token whose email is on the admin list. */
export async function verifyAdmin(
  req: Request,
): Promise<{ uid: string; email: string } | null> {
  const user = await verifyIdToken(req);
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

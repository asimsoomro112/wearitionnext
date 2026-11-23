// WEARITION — Client helper: the signed-in user's Firebase ID token for
// calling admin-only API routes (Authorization: Bearer <token>).
// The token is fetched fresh per call; it is never stored by this code
// (the Firebase SDK manages its own storage in IndexedDB).

import { auth } from '@/lib/firebase';

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

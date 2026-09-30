import { initializeApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// getAuth() throws `auth/invalid-api-key` at module load when the Firebase
// env vars are missing (e.g. `next build` on a fresh Vercel project without
// env configured). Guard it so a missing config fails gracefully instead of
// crashing the whole build. At runtime the env vars are always present.
import type { Auth } from 'firebase/auth';
function initAuth(): Auth | null {
  try {
    return getAuth(app);
  } catch {
    return null;
  }
}
export const auth = initAuth() as Auth;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const maybeAuth = auth as Auth | null;
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: maybeAuth?.currentUser?.uid,
      email: maybeAuth?.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

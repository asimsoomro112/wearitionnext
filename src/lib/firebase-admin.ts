import * as admin from 'firebase-admin';

/**
 * WEARITION — Firebase Admin SDK Initializer
 * Safe initialization to prevent build errors when env vars are missing
 */

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;

if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
    }
  } else {
    console.warn('Firebase Admin credentials missing. Admin features will be disabled.');
  }
}

if (admin.apps.length) {
  adminAuth = admin.auth();
  adminDb = admin.firestore();
}

export { adminAuth, adminDb };

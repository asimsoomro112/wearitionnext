import { db } from './firebase';
import { collection, doc, setDoc, getDoc, deleteDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

/**
 * OTP Types
 */
export type OTPType = 'verification' | 'password_reset';

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Save OTP to Firestore with 10-minute expiry
 */
export async function saveOTP(email: string, code: string, type: OTPType) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  const otpRef = doc(db, 'otps', `${email}_${type}`);
  await setDoc(otpRef, {
    email,
    code,
    type,
    expiresAt,
    createdAt: serverTimestamp(),
  });
}

/**
 * Verify OTP from Firestore
 */
export async function verifyOTP(email: string, code: string, type: OTPType): Promise<{ success: boolean; message: string }> {
  const otpRef = doc(db, 'otps', `${email}_${type}`);
  const otpSnap = await getDoc(otpRef);
  
  if (!otpSnap.exists()) {
    return { success: false, message: 'Invalid or expired code.' };
  }
  
  const data = otpSnap.data();
  const now = new Date();
  
  if (data.code !== code) {
    return { success: false, message: 'Incorrect code. Please try again.' };
  }
  
  if (data.expiresAt.toDate() < now) {
    await deleteDoc(otpRef);
    return { success: false, message: 'Code has expired. Please request a new one.' };
  }
  
  // Valid! Delete it so it can't be reused
  await deleteDoc(otpRef);
  return { success: true, message: 'Verified successfully.' };
}

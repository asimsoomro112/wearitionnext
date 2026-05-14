import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

/**
 * WEARITION — Reset Password API
 * Updates user password via Admin SDK after OTP verification
 */
export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // 1. Get user by email
    const userRecord = await adminAuth.getUserByEmail(email);

    // 2. Update password
    await adminAuth.updateUser(userRecord.uid, {
      password: newPassword,
    });

    // 3. Revoke all refresh tokens (log out from everywhere for security)
    await adminAuth.revokeRefreshTokens(userRecord.uid);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ 
      error: error.code === 'auth/user-not-found' ? 'User not found' : 'Failed to update password' 
    }, { status: 500 });
  }
}

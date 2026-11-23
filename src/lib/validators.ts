// WEARITION — Small input validators shared by API routes (pure, tested).

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length === 0 || email.length > 254) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidOtpCode(code: unknown): code is string {
  return typeof code === 'string' && /^\d{6}$/.test(code);
}

/**
 * Minimum length for a NEW password. Firebase's floor is 6; 8 is the bar
 * for resets (and the signup form enforces the same, so the two match).
 */
export function isValidPassword(password: unknown): password is string {
  return typeof password === 'string' && password.length >= 8;
}

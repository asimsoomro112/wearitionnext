export const ADMIN_EMAILS = [
  'asimsoomro195@gmail.com',
  'asimsoomro112@gmail.com',
  'admin@wearition.store',
  'admin@wearition.com'
].map(email => email.toLowerCase());

export const isAdminEmail = (email: string | null | undefined) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

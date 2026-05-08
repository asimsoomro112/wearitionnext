export const ADMIN_EMAILS = [
  'asimsoomro195@gmail.com',
  'admin@wearition.com'
];

export const isAdminEmail = (email: string | null | undefined) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

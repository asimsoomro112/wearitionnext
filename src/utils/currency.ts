/**
 * Format a price in Pakistani Rupees.
 * Prices are stored directly in PKR in Firestore.
 */
export function formatCurrency(amount: number): string {
  if (!amount && amount !== 0) return 'Rs. 0';
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
}

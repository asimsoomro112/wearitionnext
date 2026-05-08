export function formatCurrency(amount: number): string {
  // Convert assumed USD to PKR (approximate exchange rate)
  const pkrAmount = amount * 280;
  return `Rs. ${Math.round(pkrAmount).toLocaleString('en-PK')}`;
}

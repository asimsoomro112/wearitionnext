/**
 * Utility to handle image optimization and bypass hotlinking restrictions.
 */
export function getOptimizedImage(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '';
  return url.trim();
}

export function onImgError(e: any) {
  const target = e.target as HTMLImageElement;
  target.style.display = 'none';
}

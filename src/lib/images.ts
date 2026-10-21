/**
 * Utility to handle image optimization and bypass hotlinking restrictions.
 *
 * Cloudinary-hosted images are served resized to the display width with
 * automatic quality/format (w_<width>,q_auto,f_auto) instead of the full
 * original — the single biggest page-weight saving on product imagery.
 * Other hosts (e.g. ImgBB) have no reliable URL transform, so their URLs
 * pass through unchanged.
 */
export function getOptimizedImage(url: string | undefined, width = 900): string {
  if (!url || typeof url !== 'string') return '';
  const u = url.trim();
  if (u.includes('res.cloudinary.com') && u.includes('/upload/') && !u.includes('/upload/w_')) {
    return u.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
  }
  return u;
}

/** Placeholder data URI — minimal gray rectangle */
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"%3E%3Crect fill="%23f0f0f0" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23ccc" font-family="sans-serif" font-size="14"%3EImage Unavailable%3C/text%3E%3C/svg%3E';

export function onImgError(e: any) {
  const target = e.target as HTMLImageElement;
  // Show a placeholder instead of hiding the element, preventing blank holes in the UI
  target.src = PLACEHOLDER_IMAGE;
  target.style.objectFit = 'cover';
}

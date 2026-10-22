import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Private / transactional routes must not be indexed (QA SEV-3,
// 2026-10-22). They previously served the site-wide "index, follow" meta;
// robots.txt disallows crawling them, and this header states the intent
// unambiguously to any crawler that does fetch them.
const NOINDEX_PATHS = ['/checkout', '/account', '/order-success', '/admin', '/cart', '/wishlist'];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (NOINDEX_PATHS.some(p => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + '/'))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

export const config = {
  matcher: ['/checkout/:path*', '/account/:path*', '/order-success/:path*', '/admin/:path*', '/cart/:path*', '/wishlist/:path*'],
};

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The sustainability page was removed 2026-10-22 (its reselling story did
  // not match the store's actual model — new branded suits via a retailer).
  // Send its old URL to About instead of a dead end.
  async redirects() {
    return [
      { source: '/sustainability', destination: '/about', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'ibb.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'image.ibb.co' },
    ],
  },
};

export default nextConfig;

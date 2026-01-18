import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable compression so Cloudflare handles it (fixes ETag stripping)
  compress: false,
  // Remove X-Powered-By header
  poweredByHeader: false,
  // Enable ETag generation for responses
  generateEtags: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Enable image optimization caching
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  trailingSlash: false,
  // Add headers for static assets caching
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images for 1 month
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Homepage and main pages - cache with validation headers
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
          },
        ],
      },
      {
        // Products listing
        source: '/products',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
          },
        ],
      },
      {
        // Product detail pages
        source: '/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
          },
        ],
      },
      {
        // Categories
        source: '/categories/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
          },
        ],
      },
      {
        // Static pages - cache longer
        source: '/(about|faq|contact|how-it-works|privacy-policy|terms-of-service|dmca)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

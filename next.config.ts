import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // Enable Next.js Image optimization (disabled for Vercel builds by default)
    unoptimized: false,
    // Support WebP format with fallback to original format
    formats: ['image/webp', 'image/avif'],
    // Device sizes for responsive image generation
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for srcset generation
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 1 year cache for optimized images
    minimumCacheTTL: 31536000,
    // Allow SVG files
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Allow Vercel Blob storage images through Next.js Image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  // Security headers for production
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
    {
      // Allow same-origin iframe embedding for CMS preview
      source: "/(work|news|about|curriculum|professor)(.*)",
      headers: [
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
      ],
    },
    {
      // Cache static assets aggressively
      source: "/images/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Cache uploaded files
      source: "/uploads/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Cache video files aggressively
      source: "/videos/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
  // Powered by header removed for security
  poweredByHeader: false,
};

export default nextConfig;

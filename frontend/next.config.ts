import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations pour les Core Web Vitals
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@/components/ui'
    ],
  },
  
  // Configuration des images optimisées
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_API_URL?.startsWith('https') ? 'https' : 'http',
        hostname: process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname : 'localhost',
        port: process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).port : '10000',
      },
      {
        protocol: 'https',
        hostname: 'full-stack-limoon-backend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },

  // Configuration webpack optimisée
  webpack: (config, { isServer }) => {
    // Configuration pour pdfjs-dist
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        canvas: false,
      };
    }

    // Polyfill pour DOMMatrix
    config.resolve.alias = {
      ...config.resolve.alias,
      'dommatrix': 'dommatrix/dist/dommatrix.js',
    };

    // Optimisation des bundles
    config.optimization.splitChunks.cacheGroups = {
      ...config.optimization.splitChunks.cacheGroups,
      framer: {
        name: 'framer-motion',
        test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
        chunks: 'all',
        priority: 20,
      },
      ui: {
        name: 'ui-components',
        test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
        chunks: 'all',
        priority: 15,
      },
    };

    // Réduction de la taille des bundles
    if (!isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    return config;
  },

  // Configuration des headers de cache pour les performances
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },

  // Configuration compression
  compress: true,
  poweredByHeader: false,

  // Configuration Turbopack minimale
  turbopack: {},

  // Configuration des redirections
  async redirects() {
    return [
      {
        source: '/templates',
        destination: '/story',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

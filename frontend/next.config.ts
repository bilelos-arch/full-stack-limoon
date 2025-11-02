import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

    return config;
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
    ],
  },
  turbopack: {},
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*',
      },
    ];
  },
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

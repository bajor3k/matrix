
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/portfolio-matrix',
        destination: '/asset-analytics',
        permanent: true,
      },
      {
        source: '/portfolio-matrix/:path*',
        destination: '/asset-analytics',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

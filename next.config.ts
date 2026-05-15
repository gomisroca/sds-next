import type { NextConfig } from 'next';

import { env } from './src/env.js';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: env.NEXT_PUBLIC_UPLOADTHING_CDN || '',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

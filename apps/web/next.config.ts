import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  transpilePackages: ['@aviandev/core'],
};

export default nextConfig;
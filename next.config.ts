import { createMDX } from 'fumadocs-mdx/next';
  import type { NextConfig } from 'next';
  import createNextIntlPlugin from 'next-intl/plugin';
  import './src/env';

  const withNextIntl = createNextIntlPlugin();

  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });

  const config: NextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    devIndicators: false,
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          pathname: '/**',
        },
      ],
    },
    experimental: {
      serverActions: {
        bodySizeLimit: '10mb',
      },
    },
    serverExternalPackages: ['@aws-sdk/client-s3'],
    output: 'standalone',
  };

  const withMDX = createMDX();
  export default withBundleAnalyzer(withNextIntl(withMDX(config)));

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Pin the workspace root: a lockfile in the user's home directory would
  // otherwise be inferred as the root and widen the build's file tracing.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;

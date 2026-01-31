/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Faster dev builds
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  // Fix CORS warning for local network access
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://192.168.1.53:3000",
    "https://uncontiguously-conceptive-memphis.ngrok-free.dev",
  ],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Simple webpack cache for dev
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      // Simple filesystem cache
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;


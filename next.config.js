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
  // Speed up dev builds
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      // Optimize module resolution
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname),
      };
    }
    return config;
  },
};

module.exports = nextConfig;


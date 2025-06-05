import type { NextConfig } from "next";
import type webpack from "webpack"; // Import the webpack type definition
import path from "path"; // path is a Node.js built-in module

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  webpack: (
    config: webpack.Configuration,
    { isServer, dir }, // Destructure only what you need to avoid unused variable warnings
  ) => {
    // Add alias for '@/'. This directly tells Webpack how to resolve the alias.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(dir, "./"),
    };

    // If 'isServer' is not used, you can safely remove it from the destructuring:
    // webpack: (config: webpack.Configuration, { dir }) => { ... }
    // Or if you want to keep it for future reference/clarity and silence the warning:
    // void isServer;

    return config;
  },
};

export default nextConfig; // Correct: Use export default for next.config.ts

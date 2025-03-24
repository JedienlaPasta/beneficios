/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverRuntimeConfig: {
    host: "0.0.0.0",
    port: process.env.PORT || 8081,
  },
};

module.exports = nextConfig;




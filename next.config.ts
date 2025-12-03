/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    esmExternals: "loose",
  },

  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
  //     },
  //   ];
  // },
  poweredByHeader: false,
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
  },

  poweredByHeader: false,

  // Añadir configuración crítica para Docker
  // images: {
  //   unoptimized: true,
  // },
};

module.exports = nextConfig;

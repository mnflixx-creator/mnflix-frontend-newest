/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  async headers() {
    return [
      // ✅ 1) Static Next assets: CACHE them strongly (best for TVs)
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },

      // ✅ 2) Images: also ok to cache
      {
        source: "/_next/image/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },

      // ✅ 3) Everything else (pages/API): revalidate
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;

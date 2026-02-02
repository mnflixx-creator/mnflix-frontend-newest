/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this to force new file hashes
  generateBuildId: async () => {
    // This creates a unique build ID each time
    return `build-${Date.now()}`;
  },
  
  // Also add cache busting for static files
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
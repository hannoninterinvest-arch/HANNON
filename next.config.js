/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dbzweuzla/**",
      },
    ],
  },
   eslint: {
    // ⚠️ Ignore les erreurs ESLint pendant le build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Ignore les erreurs TypeScript pendant le build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
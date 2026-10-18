/** @type {import('next').NextConfig} */
const NOINDEX = { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" };
const LONG_CACHE = { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" };

const nextConfig = {
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: ["pg", "bcryptjs", "cloudinary", "jsonwebtoken"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      // Any *.vercel.app alias (previews, deployment URLs) must never compete with the canonical domain.
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [NOINDEX],
      },
      // Private areas. Authentication and authorization are still enforced by the application itself.
      { source: "/admin/:path*", headers: [NOINDEX] },
      { source: "/dashboard/:path*", headers: [NOINDEX] },
      { source: "/login", headers: [NOINDEX] },
      { source: "/register", headers: [NOINDEX] },
      { source: "/api/:path*", headers: [NOINDEX] },
      {
        source:
          "/:file(favicon.ico|favicon-16x16.png|favicon-32x32.png|apple-touch-icon.png|icon.png|icon-192.png|icon-512.png|og-image.jpg|logoha.webp|footer.webp)",
        headers: [LONG_CACHE],
      },
    ];
  },
};

module.exports = nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
      ],
    }];
  },
  /* 
     OPTIMASI NEXT.JS MEMBER LBQUEEN
     ---------------------------
     - Mengatasi error WebSocket/HMR di jaringan lokal
     - Meningkatkan stabilitas dev server di Windows
  */

  reactStrictMode: true,

  // Turbopack config (Next.js 16 default bundler)
  // Kosong = pakai default Turbopack, cukup untuk silence error
  turbopack: {},

  // Webpack tetap dipertahankan untuk fallback & kompatibilitas
  // watchOptions di sini tidak berpengaruh saat Turbopack aktif,
  // tapi aman dibiarkan untuk jaga-jaga jika build pakai --webpack
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  serverExternalPackages: [],
};

export default nextConfig;

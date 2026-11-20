import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// CSP tanpa nonce agar halaman statis tetap statis. Inline script Next.js butuh 'unsafe-inline',
// tetapi skrip dari domain lain dan pengiriman data ke domain lain diblokir.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval' https://va.vercel-scripts.com"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
  "font-src 'self' data:",
  `connect-src 'self'${isProd ? "" : " ws: https://va.vercel-scripts.com"}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "media-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isProd && process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
].join("; ");

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
        { key: 'Content-Security-Policy', value: CSP },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
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

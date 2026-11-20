import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

export const viewport = {
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lbqueen.id"),
  title: "LBQueen: Pesan Treatment Online Terpercaya",
  description:
    "Portal member LBQueen Beauty Clinic untuk pemesanan treatment dan produk kecantikan online",
  manifest: "/manifest.json",
  icons: {
    icon: "/lbqueen-logo-192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LBQueen",
  },
};

import { Providers } from "@/components/Providers";
import { THEME_SCRIPT } from "@/lib/theme-mode";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Kelas "dark" dipasang skrip di <head> sebelum render, jadi atribut <html> sengaja berbeda dari server.
    <html lang="id" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#C94F78" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#main-content">
          Lewati ke konten
        </a>
        <Providers>{children}</Providers>
        <SpeedInsights />
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function() {},
                    function() {}
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

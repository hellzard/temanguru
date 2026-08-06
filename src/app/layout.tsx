import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OfflineBanner } from "@/components/offline-banner";
import { PwaRegistrar } from "@/components/pwa-registrar";
import { ThemeBootstrapScript } from "@/components/theme/theme-bootstrap-script";
import { ThemeProvider } from "@/lib/theme/theme-provider";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Teman Guru", template: "%s · Teman Guru" },
  description: "Ruang kerja guru local-first yang dapat dipakai tanpa login, dengan backup manual dan sinkronisasi akun opsional.",
  applicationName: "Teman Guru",
  category: "education",
  authors: [{ name: "Teman Guru" }],
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Teman Guru",
    title: "Teman Guru — Pakai langsung, login hanya untuk sinkron",
    description: "Presensi, jurnal, nilai, dokumen, agenda, dan inventaris yang dapat dipakai tanpa login.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Teman Guru" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teman Guru",
    description: "Ruang kerja guru local-first dengan login opsional dan backup manual.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeBootstrapScript />
        <ThemeProvider>
          <a href="#konten-utama" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-slate-950 focus:shadow">Lewati ke konten</a>
          <OfflineBanner />
          <div id="konten-utama">{children}</div>
          <PwaRegistrar />
        </ThemeProvider>
      </body>
    </html>
  );
}

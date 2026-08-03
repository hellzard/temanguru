import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OfflineBanner } from "@/components/offline-banner";
import { PwaRegistrar } from "@/components/pwa-registrar";
import { StarterBanner } from "@/components/starter-banner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Teman Guru", template: "%s · Teman Guru" },
  description: "Catat kegiatan mengajar sekali, ubah menjadi presensi, jurnal, nilai, dan laporan.",
  applicationName: "Teman Guru",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Teman Guru",
    title: "Teman Guru",
    description: "Catat kegiatan mengajar sekali, ubah menjadi presensi, jurnal, nilai, dan laporan.",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#4f46e5" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <a href="#konten-utama" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">Lewati ke konten</a>
        <StarterBanner />
        <OfflineBanner />
        <div id="konten-utama">{children}</div>
        <PwaRegistrar />
      </body>
    </html>
  );
}

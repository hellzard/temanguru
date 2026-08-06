import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import "./ui-overhaul.css";
import { OfflineBanner } from "@/components/offline-banner";
import { PwaRegistrar } from "@/components/pwa-registrar";
import { ThemeBootstrapScript } from "@/components/theme/theme-bootstrap-script";
import { ThemeProvider } from "@/lib/theme/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Teman Guru — Ruang Kerja Harian untuk Guru",
    template: "%s · Teman Guru",
  },
  description:
    "Rapikan presensi, jurnal, nilai, dokumen, agenda, dan kebutuhan kelas dalam satu ruang kerja yang ringan dan dapat dimulai tanpa akun.",
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
    title: "Teman Guru — Lebih sedikit urusan admin, lebih banyak waktu mengajar",
    description:
      "Ruang kerja harian untuk presensi, jurnal, nilai, dokumen, agenda, dan kebutuhan kelas.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Teman Guru — Ruang kerja harian untuk guru",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teman Guru — Ruang Kerja Harian untuk Guru",
    description:
      "Rapikan pekerjaan mengajar dalam satu tempat yang ringan dan dapat dimulai tanpa akun.",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable}`}
    >
      <body>
        <ThemeBootstrapScript />
        <ThemeProvider>
          <a
            href="#konten-utama"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-slate-950 focus:shadow"
          >
            Lewati ke konten
          </a>
          <OfflineBanner />
          <div id="konten-utama">{children}</div>
          <PwaRegistrar />
        </ThemeProvider>
      </body>
    </html>
  );
}

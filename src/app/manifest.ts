import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Teman Guru",
    short_name: "Teman Guru",
    description: "Ruang kerja harian guru: presensi, jurnal, nilai, dan laporan.",
    id: "/",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8fc",
    theme_color: "#4f46e5",
    lang: "id",
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/maskable-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}

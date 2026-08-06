import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Teman Guru",
    short_name: "Teman Guru",
    description: "Ruang kerja harian guru: presensi, jurnal, nilai, dokumen, dan kegiatan sekolah.",
    id: "/",
    start_url: "/workspace",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8fc",
    theme_color: "#4f46e5",
    lang: "id",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    share_target: {
      action: "/workspace",
      method: "GET",
      enctype: "application/x-www-form-urlencoded",
      params: { title: "title", text: "text", url: "url" },
    },
  } as MetadataRoute.Manifest & { share_target: Record<string, unknown> };
}

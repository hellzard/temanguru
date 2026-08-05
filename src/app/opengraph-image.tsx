import { ImageResponse } from "next/og";

export const alt = "Teman Guru — ruang kerja harian guru Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          color: "white",
          background: "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 55%, #14b8a6 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.9 }}>TEMAN GURU</div>
        <div style={{ marginTop: 28, maxWidth: 950, fontSize: 68, lineHeight: 1.08, fontWeight: 800 }}>
          Catat sekali, pekerjaan guru menjadi lebih rapi.
        </div>
        <div style={{ marginTop: 28, fontSize: 30, opacity: 0.9 }}>
          Presensi · Jurnal · Nilai · Dokumen · Kegiatan Sekolah
        </div>
      </div>
    ),
    size,
  );
}

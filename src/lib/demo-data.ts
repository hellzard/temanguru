export const todayClasses = [
  { time: "07.00–08.20", className: "VIII A", subject: "Matematika", room: "Ruang 8A" },
  { time: "09.00–10.20", className: "VIII B", subject: "Matematika", room: "Ruang 8B" },
  { time: "11.00–12.20", className: "VII C", subject: "Matematika", room: "Ruang 7C" },
];

export const pendingItems = [
  { title: "Jurnal VIII B belum lengkap", detail: "Tambahkan refleksi dan tindak lanjut", tone: "warning" },
  { title: "12 nilai belum diisi", detail: "Asesmen Pecahan — VIII A", tone: "neutral" },
  { title: "5 murid perlu tindak lanjut", detail: "Kehadiran di bawah pola kelas", tone: "danger" },
] as const;

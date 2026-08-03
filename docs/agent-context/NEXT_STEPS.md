# Instruksi untuk Agen Selanjutnya

Halo, Agen! Jika Anda membaca file ini, Anda sedang melanjutkan pekerjaan pengembangan **Teman Guru** di perangkat (device) lain. 

## Konteks Proyek
Ini adalah repositori **Teman Guru**, sebuah PWA mobile-first untuk meringankan beban administrasi guru di Indonesia (seperti presensi, jurnal mengajar, rekap nilai).
- Stack: **Next.js 16 (App Router)**, Tailwind CSS, Supabase.
- Aturan Kunci: Ikuti semua panduan di `AGENTS.md` dan `GEMINI.md`. Jangan gunakan komponen "dummy", buat *vertical slice* yang langsung berfungsi dengan RLS di DB.
- Referensi Status: Anda bisa melihat `docs/agent-context/walkthrough.md` untuk mengetahui rincian teknis persis apa saja yang baru diselesaikan di _session_ terakhir.

## Status Terakhir
- **Wave 0 & 1**: Infrastruktur, kelas, jadwal. (Selesai)
- **Wave 2**: Pencatatan Kelas (Presensi, Jurnal), Ekspor Rekap CSV, dan fallback Offline Data via IndexedDB `idb`. (Selesai)
- **Wave 3 (Slice 1)**: Modul **Penilaian & Bobot** (Assessment). Kerangka penilaian dan entri nilai untuk siswa di sebuah kelas berhasil diimplementasikan di rute `/assessment`. (Selesai)

## Tugas Anda Selanjutnya (Next Steps)
Anda ditugaskan untuk mulai mengerjakan **Wave 3 (Slice 2): Rapor Otomatis / Weighting Calculation**.
- **Deskripsi**: Hitung dan tampilkan akumulasi akhir siswa menggunakan nilai dari `assessment_scores` dan `weight` dari tabel `assessments`. 
- **Tujuan**: Memungkinkan guru mencetak atau membagikan ringkasan nilai (semacam draf e-Rapor atau rapor bayangan). 

Silakan cek `task.md` di folder ini dan buat `/plan-wave` untuk slice 2. Semoga berhasil!

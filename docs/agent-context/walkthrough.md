# 🚀 Wave 1 Slice 6: Real-data Dashboard Hari Ini

Integrasi data kalender harian ke dalam halaman *Dashboard* utama telah sukses dilakukan, yang sekaligus menandai **berakhirnya iterasi Wave 1** (Teacher Setup).

## 🛠 Apa Saja yang Dibuat?

## Wave 1, Slice 6: Real-data Dashboard Hari Ini

- Modified `src/app/(dashboard)/dashboard/page.tsx` to retrieve real user data instead of dummy data.
- Fetched active academic years to determine the current academic year scope.
- Queried `teaching_assignments` alongside `classes` and `subjects` relationships.
- Displayed real teaching schedules in the "Jadwal Hari Ini" section.
- Added empty states to gracefully handle users with no active assignments.

## Wave 2, Slice 1: Catat Kelas 60 Detik

- **Updated Dashboard Links**: Directed teaching schedule cards to `/record?assignmentId=[id]&date=[date]` to combine presensi and jurnal workflows into a unified experience.
- **Server Action for Transactional Save**: Created `saveClassRecord` in `src/app/(dashboard)/record/actions.ts` handling the insertion/updating of `attendance_sessions`, `attendance_records`, and `teaching_journals` safely in one transaction block based on validated Zod schema.
- **Record Page (Data Fetching)**: Created `src/app/(dashboard)/record/page.tsx` to safely fetch initial assignment configurations and the student roster using `assignment_id` and `date` query strings, effectively enforcing tenant/RLS bounds.
- **Unified Client Interface**: Developed `src/app/(dashboard)/record/client.tsx` that leverages `useTransition` for optimistic UI and immediate submission feedback.
  - Implements rapid attendance marking (Hadir, Izin, Sakit, Alpa, Telat) with one touch.
  - Quick-entry fields for Teaching Journals (Topic, Activity, Reflection, Obstacle, Follow-up).
- Verified type safety across the new architecture components to ensure seamless integration (`npm run typecheck` and `npm run lint` successful).

## Wave 2 (Slice 2): Follow-up List & Monthly Recap
- **Rekap Bulanan**: Membuat halaman `/recap` yang menampilkan data absensi (Hadir, Sakit, Izin, Alpa, Telat) dan jurnal (Topik, Kegiatan, Refleksi) gabungan per tanggal secara lazy-fetch.
- **Tindak Lanjut & Hambatan**: Menyorot khusus entri jurnal yang memiliki hambatan atau tindak lanjut dengan notifikasi amber di atas tabel rekap, memudahkan guru meninjau masalah yang memerlukan perhatian.
- **Export CSV**: Menambahkan fungsi `papaparse` berbasis sisi klien untuk mengunduh rekap bulan terpilih ke dalam file `.csv` guna keperluan pelaporan (bebas-server, offline-friendly).
- **TypeScript Support**: Berhasil menyelesaikan pengetikan strict dengan Supabase `Record<string, unknown>[]` menggantikan tipe `any`.

## Testing & Validation
- **Lint & Typecheck**: Semua file berhasil melewati kualitas `npm run lint` dan `npm run typecheck` tanpa galat maupun peringatan.
- **UI Responsiveness**: Komponen tabel dibungkus dalam wadah `overflow-x-auto` yang mendukung layar mobile, dan drop-down seleksi dibuat dengan gaya serasi (tailwind `slate` dan `indigo`).

## Wave 2 (Slice 3): Offline Draft untuk Catat Kelas (IndexedDB)
- **Offline DB Wrapper**: Membangun utilitas basis data di `src/lib/offline-db.ts` dengan menggunakan library `idb` (IndexedDB) browser untuk menyimpan payload yang gagal disinkronisasikan karena koneksi terputus.
- **Fail-safe Form Submission**: Memodifikasi aksi "Simpan" di halaman `Catat Kelas`. Apabila `navigator.onLine` mengembalikan false, atau Server Action `saveClassRecord` memunculkan `Failed to fetch`, form otomatis tersimpan sebagai draft di `outbox` dan pengguna akan menerima toast konfirmasi ("Tersimpan sebagai draft offline").
- **Sync Status UI**: Menginjeksi komponen `SyncStatus` di level `layout.tsx` (yang membungkus Dashboard) agar notifikasi data yang belum tersinkronisasi selalu muncul persisten di bagian kanan bawah antarmuka pengguna, siap disinkronisasikan kapan saja saat jaringan kembali membaik.

## Wave 3 (Slice 1): Assessment & Weighting
- **Assessment Listing & Creation (`/assessment`)**: Menambahkan halaman khusus untuk membuat kerangka penilaian (Tugas, Kuis, UTS, UAS). Guru dapat menentukan judul, kategori, tanggal, nilai maksimum, dan *weight* (bobot nilai). Halaman menampilkan daftar penilaian yang telah dibuat dalam format *card-grid* yang rapi.
- **Score Entry (`/assessment/[id]`)**: Menambahkan form spreadsheet-like (mirip seperti *Catat Kelas 60 Detik*) khusus untuk mencatat nilai per murid yang tergabung di kelas tersebut, dilengkapi dengan kemampuan menulis catatan individu (contoh: "Butuh perbaikan").
- **Server Actions terpisah (`actions.ts`)**: Fungsi CRUD nilai di-handle via *Server Actions* yang divalidasi oleh kebijakan Row Level Security (RLS) di sisi database untuk memastikan hanya guru bersangkutan / admin sekolah yang berhak mengisi dan melihat nilai tersebut.
- **Navigasi Terpusat**: Memperbarui bilah samping (Sidebar) dengan menu **Penilaian**.

## Wave 3 (Slice 2): Rapor Otomatis / Weighting Calculation
- **Entry Point Terintegrasi**: Memodifikasi `src/app/(dashboard)/assessment/client.tsx` dengan penambahan tombol "Lihat Rapor Kelas" di daftar penilaian yang secara otomatis terhubung ke kelas yang dipilih.
- **Perhitungan Otomatis**: Membuat halaman khusus (`/assessment/report/[assignmentId]`) untuk melakukan agregasi nilai akhir (akumulasi berbobot) dari setiap murid menggunakan rumus `Sum(Percentage * Weight) / Sum(Weight)`. 
- **Tabel Rekap Nilai**: Menampilkan nilai per tugas dan nilai akhir pada antarmuka tabel ringkas. Nilai dasar disesuaikan dengan nilai ujian perbaikan (`final_score`) jika tersedia, lalu ke `original_score`, dan diasumsikan 0 jika belum ada.
- **Dukungan Cetak Rapor**: Menambahkan fungsionalitas cetak (`window.print()`) dengan optimasi gaya `@media print` untuk menyembunyikan elemen dashboard (tombol, sidebar) sehingga rapor tercetak bersih bagai dokumen resmi.
- **Verifikasi Kualitas**: Berhasil melewati uji *linting* (`npx eslint`) serta integritas tipe TypeScript (`npm run typecheck`), menjamin keamanan eksekusi dan tidak adanya *bug* tersembunyi.

## Next Smallest Vertical Slice
**Wave 4 (Slice 1): Dokumen Studio (Document Templates)**
Mengimplementasikan modul untuk pembuatan, pengelolaan, dan penandatanganan dokumen sekolah otomatis. Termasuk format kop surat, layout tanda tangan, hingga verifikasi identitas (opsional). Ini akan memungkinkan guru mencetak dokumen tanpa format ulang berulang kali.

## Validation Results

1. **Penghapusan Dummy Data**
   - File `page.tsx` pada halaman utama (`/dashboard`) tidak lagi mengimpor `demo-data.ts`. Seluruh data statis yang sebelumnya digunakan untuk simulasi telah dicabut.

2. **Kueri Jadwal Terpersonalisasi**
   - Setiap guru yang masuk akan melihat kueri langsung terhadap kalender hari ini (berdasarkan zona waktu), yang disesuaikan secara khusus dengan Penugasan Mengajar (*teaching_assignments*) dan Tahun Ajaran (*academic_years*) aktif. 
   - Jam mulai (`starts_at`) digunakan untuk mengurutkan rentetan kelas, memastikan guru melihat jadwal selanjutnya paling atas.

3. **Agregasi Murid Unik**
   - Angka "Murid aktif" di bagian Ringkasan bukan lagi sekadar angka *dummy*. Sistem menghitungnya dengan mengambil himpunan seluruh kelas yang diajar oleh guru terkait, lalu melakukan ekstraksi jumlah murid *(distinct)* melalui struktur set.

4. **Kondisi Kosong (*Empty States*)**
   - Menambahkan pesan UX informatif bila guru masuk di hari libur (Tidak ada jadwal mengajar hari ini) atau bila admin sekolah belum mengkonfigurasi Tahun Ajaran aktif sama sekali.

Semuanya telah lolos uji tipe Typescript ketat dan tidak menghasilkan peringatan linter.

> [!TIP]
> Selamat! Kita telah menyelesaikan fondasi data awal. Coba periksa halaman `Beranda` (`/dashboard`) sekarang; layar akan menyesuaikan dengan hari yang sedang berlangsung, mengikuti jadwal yang telah Anda buat pada tahap sebelumnya.
>
> Selanjutnya kita akan masuk ke **Wave 2** (Presensi & Jurnal). Ketik `/plan-wave` jika Anda sudah siap untuk mulai merancang implementasi kelas cepat (Catat Kelas 60 Detik)!

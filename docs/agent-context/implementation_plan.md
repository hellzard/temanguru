# Wave 3 Slice 1: Assessment & Weighting

Implementasi fitur manajemen nilai dan komponen penilaian untuk memfasilitasi pencatatan hasil belajar siswa.

## Proposed Changes

### `src/app/(dashboard)/assessment/page.tsx`
[NEW] Halaman utama untuk memilih kelas/mata pelajaran dan menampilkan daftar penilaian (assessments) yang sudah ada.

### `src/app/(dashboard)/assessment/actions.ts`
[NEW] Server Actions untuk:
1. Mengambil daftar penilaian berdasarkan `teaching_assignment_id`.
2. Membuat penilaian baru (insert ke `assessments`).
3. Mengambil daftar murid beserta nilainya untuk suatu `assessment_id`.
4. Menyimpan/memperbarui daftar `assessment_scores`.

### `src/app/(dashboard)/assessment/client.tsx`
[NEW] Komponen sisi klien untuk menangani form pembuatan penilaian baru dan daftar interaktif penilaian.

### `src/app/(dashboard)/assessment/[id]/page.tsx` & `client.tsx`
[NEW] Halaman detail penilaian untuk menginput nilai (scores) murid.

## Verification Plan
- Mensimulasikan mode *Offline* pada browser DevTools.
- Membuat catatan kelas, memastikan form berhasil dan data masuk ke IndexedDB `outbox`.
- Mengembalikan mode ke *Online*.
- Menekan tombol "Sinkronisasi Sekarang" dan memastikan data berhasil masuk ke DB Supabase dan terhapus dari `outbox`.
- Mengecek tab Recap untuk memastikan data yang disinkronisasi tampil.

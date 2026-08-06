# Arsitektur

## Jalur guest-first

- `/workspace` adalah PWA client-side yang tidak memerlukan sesi.
- `WorkspaceProvider` memuat dan menyimpan satu `LocalWorkspace`.
- IndexedDB `temanguru-local-workspace` menjadi storage utama; localStorage hanya fallback.
- Backup manual menggunakan envelope JSON tervalidasi.
- Setelah login, snapshot yang sama dapat di-upsert ke Supabase.

## Jalur akun dan sekolah

- Supabase Auth menangani email+sandi dan recovery OTP.
- `user_workspace_snapshots` menangani sinkronisasi ruang kerja pribadi.
- Modul sekolah multi-user lama tetap memakai server component/action, active-school context, RLS, dan transaksi PostgreSQL.
- Route sekolah tetap membutuhkan session; pengguna tanpa session diarahkan ke `/workspace`.

## Konflik sinkronisasi

Strategi saat ini adalah snapshot last-write-wins:

- Ruang kerja lokal kosong mengambil versi cloud.
- Versi dengan `updatedAt` lebih baru menjadi sumber sinkronisasi.
- Tombol status akun dapat memicu sinkronisasi ulang.
- Restore cloud mempertahankan timestamp sumber agar tidak langsung diunggah balik.

Untuk kerja kolaboratif simultan, gunakan modul sekolah multi-user, bukan snapshot workspace pribadi.

## PWA

Service worker menyimpan shell `/workspace`, halaman offline, dan aset ikon. Route sekolah/API privat tidak dimasukkan ke cache. Data ruang kerja tetap berada di IndexedDB dan bukan di Cache Storage.

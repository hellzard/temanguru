# Rebuild Report — Teman Guru v0.4

## Sumber dan ruang lingkup

Repository ini memakai `hellzard/temanguru` commit `42d714c7104e173663136130742b8a69af99b43d` sebagai baseline fitur. Seluruh pekerjaan dilakukan pada salinan lokal untuk menghasilkan ZIP baru. Tidak ada push ke GitHub, perubahan project Vercel, atau migration ke database pengguna.

## Arsitektur baru: guest-first

Teman Guru sekarang mempunyai dua jalur penggunaan yang jelas:

1. **Mode lokal tanpa login** — fitur inti dibuka melalui `/workspace`; data disimpan di browser perangkat.
2. **Mode akun opsional** — email dan kata sandi dipakai untuk menyimpan satu snapshot ruang kerja ke Supabase dan memulihkannya pada perangkat lain.

Akun bukan syarat membuka aplikasi. Route sekolah lama yang membutuhkan sesi tetap dilindungi, sedangkan pengguna tanpa sesi diarahkan ke ruang kerja lokal, bukan dipaksa login.

## Fitur mode lokal

- Ringkasan ruang kerja.
- Kelas dan murid.
- Presensi, materi, dan jurnal per pertemuan.
- Penilaian dan nilai murid.
- Dokumen lokal.
- Acara, rapat, dan tugas.
- Inventaris sederhana.
- Identitas ruang kerja.
- Backup/restore JSON.
- PWA dan penggunaan offline setelah shell aplikasi tersimpan.

## Login, OTP, dan sinkronisasi

- Login memakai `signInWithPassword`.
- Pendaftaran memakai email dan kata sandi.
- Konfirmasi email dapat dimatikan di Supabase agar pengguna langsung masuk setelah daftar.
- Pemulihan kata sandi mengirim OTP recovery ke email, memverifikasi kode di aplikasi, lalu menyimpan kata sandi baru.
- Snapshot cloud disimpan pada `user_workspace_snapshots` dan hanya dapat dibaca/diubah oleh pemilik akun melalui RLS.
- Perangkat baru yang ruang kerjanya kosong mengambil snapshot cloud.
- Perangkat dengan perubahan yang lebih baru mengunggah snapshot lokal.
- Keluar dari akun tidak menghapus data perangkat.

## Backup manual

Backup dibuat sebagai file JSON ber-envelope dan divalidasi dengan Zod saat dipulihkan. Ukuran restore dibatasi 15 MB. File backup tidak dienkripsi; pengguna diberi peringatan agar menyimpannya di tempat aman.

## Perbaikan dari baseline sebelumnya

Perbaikan hardening v0.3 tetap dipertahankan, termasuk active-school context, tenant integrity, RLS berbasis anggota aktif, transaksi Catat Kelas/inventaris, impor murid atomik, CSP, security headers, audit, CI, test database, dan pemisahan cache privat.

## Yang sengaja tidak dilakukan

- Tidak menghapus source atau deployment lama pengguna.
- Tidak mengunggah repository ke GitHub.
- Tidak menghubungkan repository ke Vercel.
- Tidak menjalankan migration pada Supabase milik pengguna.
- Tidak menyertakan `.env.local`, token, password database, `node_modules`, `.next`, atau `.vercel`.

# Teman Guru — Aturan Kerja Wajib

Aturan ini berlaku untuk seluruh pekerjaan pada workspace Teman Guru.

## Tujuan

Selesaikan pekerjaan end-to-end untuk pengguna nonteknis. Jangan berhenti pada rencana, potongan kode, atau daftar command. Jalankan command, baca log, perbaiki error, uji browser, dan hasilkan bukti.

## Batas keamanan

- Jangan pernah menampilkan, commit, atau menaruh pada artifact: password, token, service-role key, database password, OTP, cookie, atau isi `.env*`.
- Jangan memakai force push, menghapus repository/project, atau menghapus deployment lama sebelum versi baru sehat.
- Jangan mengubah database production sebelum migration lokal, pgTAP/RLS, preview, backup/rollback, dan persetujuan pengguna selesai.
- Gunakan data sintetis untuk test.
- Jangan menonaktifkan RLS untuk membuat test lulus.
- Jangan menjadikan service-role key sebagai environment browser.
- Jangan mengubah produk guest-first menjadi login wajib.

## Git dan cloud

- Buat backup branch/tag sebelum mengganti `main`.
- Jangan commit `.env.local`, `.vercel`, `node_modules`, `.next`, `supabase/.temp`, atau credential.
- Push hanya setelah quality gate lokal lulus.
- Jika autentikasi diperlukan, minta pengguna hanya menyelesaikan layar login/authorization.
- Untuk billing, production database, dan production deployment, minta persetujuan.

## Pelaporan

Perbarui `AUTOPILOT_STATUS.md` setiap fase. Laporkan status tanpa secret. Jika gagal, perbaiki dan ulangi. Vercel READY tidak cukup bila CI atau test merah.

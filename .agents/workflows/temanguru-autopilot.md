# Teman Guru Autopilot

## Deskripsi

Menyiapkan, memperbaiki, menguji, menghubungkan, dan mendeploy Teman Guru secara end-to-end untuk pengguna awam.

## Langkah

1. Baca seluruh `.agents/rules/`, `ANTIGRAVITY_BACA_DULU.txt`, `docs/ANTIGRAVITY_AUTOPILOT.md`, arsitektur, auth/sync, dan security model.
2. Ubah `AUTOPILOT_STATUS.md` ke fase AUDIT.
3. Audit source, Git, Node/npm, Docker, Supabase CLI, GitHub, Supabase, dan Vercel. Jalankan `npm run doctor`.
4. Jangan meminta pengguna mengetik command atau memperbaiki error teknis.
5. Verifikasi guest-first: workspace tanpa login, backup/restore, email+sandi, recovery OTP, cloud sync/RLS, dan tidak ada magic-link wajib.
6. Perbaiki source, UX, keamanan, migration, test, CI, dan dokumentasi.
7. Jalankan `/temanguru-local-verify`; perbaiki sampai hijau.
8. Jalankan `/temanguru-cloud-setup`.
9. Jalankan `/temanguru-deploy`.
10. Jalankan `/temanguru-final-audit`.
11. Buat walkthrough dengan perubahan, hasil test, screenshot, SHA, URL, dan rollback.
12. Tandai selesai hanya bila seluruh quality gate lulus.

## Pengguna hanya boleh diminta untuk

- login/authorization;
- menyalakan Docker bila OS memerlukannya;
- menyetujui biaya;
- menyetujui perubahan database production;
- menyetujui penggantian production deployment/domain.

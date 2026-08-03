# Autopilot Guide

Kamu tidak perlu menjalankan `npm install`, mengisi `.env.local`, menyalakan server, atau menjalankan pemeriksaan sendiri.

## Yang kamu lakukan

1. Ekstrak ZIP.
2. Buka foldernya di Antigravity.
3. Tempel isi `prompts/00-AUTOPILOT-FIRST-MESSAGE.md`.
4. Tekan kirim.
5. Setujui login atau authorization bila Antigravity benar-benar memintanya.

## Yang dilakukan Antigravity

- memeriksa Node.js, npm, dan Git;
- memasang dependency;
- membuat `.env.local`;
- menyambungkan project Supabase;
- mengambil Project URL dan publishable key;
- menjalankan migration;
- menjalankan lint, TypeScript, test, dan build;
- menyalakan aplikasi lokal;
- membuka dan menguji web melalui browser;
- memperbaiki error setup;
- mencatat hasilnya;
- menyusun fitur berikutnya.

## Kapan kamu masih diperlukan

Antigravity mungkin tetap memerlukan satu klik atau keputusan ketika:

- akun Supabase/GitHub/Vercel belum login;
- connector meminta izin akses;
- pembuatan project memerlukan pilihan organisasi atau region;
- instalasi Node.js memerlukan izin administrator;
- layanan menunjukkan batas kuota atau billing.

Itu adalah batas keamanan akun, bukan pekerjaan coding yang harus kamu kerjakan sendiri.

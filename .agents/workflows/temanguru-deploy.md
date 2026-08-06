# Teman Guru Deploy

## Langkah

1. Pastikan local verify dan cloud setup hijau.
2. Jalankan secret scan ulang dan periksa `.gitignore`.
3. Buat commit terstruktur dan push tanpa force.
4. Tunggu GitHub Actions. Bila gagal, perbaiki, uji lokal, commit, dan push kembali.
5. Buat/tunggu Vercel Preview.
6. Uji preview melalui Browser Agent: landing, workspace tamu, backup/restore, auth, OTP, sync dua sesi, tema, responsif, console/network, health endpoint, dan runtime logs.
7. Jangan production bila preview/CI/database/audit belum hijau.
8. Sebelum production, pastikan rollback dan deployment lama tersedia; minta persetujuan untuk perubahan production.
9. Deploy production, cek domain utama, ulangi smoke test, dan cek logs.
10. Catat deployment ID, SHA, URL, dan rollback pada status.

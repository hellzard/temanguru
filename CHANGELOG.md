# Changelog

## 0.4.0 — Guest-first workspace dan akun opsional

- Menambahkan `/workspace` yang dapat dipakai tanpa login.
- Menyimpan data tamu di IndexedDB dengan fallback localStorage.
- Menambahkan kelas, murid, presensi, jurnal, penilaian, dokumen, agenda, dan inventaris local-first.
- Menambahkan backup dan restore manual melalui file JSON tervalidasi.
- Mengganti magic-link dengan daftar/masuk memakai email dan kata sandi.
- Menambahkan pemulihan kata sandi menggunakan OTP yang diketik langsung di aplikasi.
- Menambahkan tabel snapshot cloud milik pengguna dengan RLS untuk sinkronisasi antarperangkat.
- Menambahkan pemulihan otomatis pada perangkat baru dan unggahan otomatis setelah perubahan lokal.
- Mengubah landing page, manifest, service worker, privacy, terms, dan dokumentasi deployment.
- Memperbarui runtime ke Node.js 22 dan menambah preflight environment.

## 0.3.0 — Production-candidate rebuild

- Merekonstruksi repository dari baseline Teman Guru sebelumnya.
- Memperketat RLS, tenant integrity, transaksi, auth redirect, CI, dan PWA.
- Mengembangkan modul akademik, dokumen, acara, rapat, operasional, Connect, dan portofolio.

# MULAI DARI SINI — Teman Guru Guest-First v0.4

Versi ini mempunyai dua cara pakai:

1. **Tanpa login** — semua data utama disimpan di perangkat melalui IndexedDB. Backup dilakukan manual ke file JSON.
2. **Dengan akun** — login memakai email + kata sandi. Snapshot ruang kerja disinkronkan ke Supabase agar dapat dibuka di perangkat lain.

Fitur lupa kata sandi memakai **kode OTP email**, bukan magic link.

## Urutan pemasangan yang disarankan

1. Baca `docs/INSTALL_STEP_BY_STEP.md`.
2. Buat project Supabase baru.
3. Pasang migration dengan Supabase CLI.
4. Atur login email+sandi dan template OTP.
5. Upload folder ini ke GitHub.
6. Import repository ke Vercel.
7. Isi environment variables.
8. Deploy dan jalankan checklist pengujian.

## Hal penting

- Jangan upload file ZIP ke dalam repository. Ekstrak dahulu lalu upload **isi folder `temanguru`**.
- Jangan pernah memasukkan `service_role`, `secret key`, atau password database ke Vercel sebagai `NEXT_PUBLIC_*`.
- Jangan hapus deployment lama sebelum deployment baru berhasil diuji.
- Mode tanpa login tetap bekerja walau Supabase belum dikonfigurasi.

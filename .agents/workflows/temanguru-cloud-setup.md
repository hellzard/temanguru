# Teman Guru Cloud Setup

## Langkah

1. Jangan lanjut sebelum local verify hijau.
2. GitHub:
   - buat backup branch/tag;
   - jangan force push;
   - hubungkan/buat repo melalui CLI atau Browser Agent;
   - minta pengguna hanya untuk login/authorization.
3. Supabase:
   - prioritaskan project baru/staging jika schema lama tidak jelas;
   - minta persetujuan bila berbayar;
   - jangan menampilkan password/key;
   - bandingkan migration history;
   - backup dan minta persetujuan sebelum menyentuh production lama;
   - aktifkan Email + Password;
   - matikan Confirm Email hanya sesuai kontrak produk;
   - gunakan template recovery token OTP `{{ .Token }}`;
   - atur Site URL/Redirect URL localhost, preview, production;
   - verifikasi RLS `user_workspace_snapshots`.
4. Vercel:
   - pilih project yang benar atau buat baru;
   - hubungkan GitHub;
   - gunakan Next.js dan Node 22.x;
   - tambah env tanpa mencetak nilainya:
     `NEXT_PUBLIC_SUPABASE_URL`,
     `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
     `NEXT_PUBLIC_APP_URL`,
     `APP_ALLOWED_ORIGINS`,
     `NEXT_PUBLIC_APP_STAGE`.
5. Jangan memasukkan service-role key ke client.
6. Perbarui status dengan ID/nama resource nonrahasia.

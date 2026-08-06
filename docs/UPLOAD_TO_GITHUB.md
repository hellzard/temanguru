# Upload manual ke GitHub

## Cara yang paling aman

1. Ekstrak ZIP hingga terlihat `package.json`, `src`, `supabase`, dan `.github`.
2. Buat repository GitHub baru atau kosongkan repository lama.
3. Upload **isi folder `temanguru`**, bukan folder induknya.
4. Pastikan file tersembunyi ikut terunggah, terutama:
   - `.github/`
   - `.gitignore`
   - `.npmrc`
   - `.nvmrc`
5. Jangan upload:
   - `.env.local`
   - `.vercel/`
   - `node_modules/`
   - `.next/`
   - `supabase/.temp/`
6. Commit ke branch `main`.
7. Buka tab Actions. Workflow `quality` harus hijau sebelum production digunakan.

## Mengganti repository lama

Lebih aman membuat repository baru atau membuat backup/tag terhadap repository lama sebelum menghapus isinya. Source lama dapat dipertahankan sebagai arsip private selama masa transisi.

## Setelah upload

- Buat project Supabase staging atau jalankan Supabase lokal.
- Terapkan migration sesuai `SUPABASE_SETUP.md`.
- Hubungkan repository ke Vercel.
- Masukkan environment variables.
- Periksa Preview Deployment sebelum mengarahkan domain production.

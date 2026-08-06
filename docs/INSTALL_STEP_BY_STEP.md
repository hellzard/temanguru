# Panduan Instalasi Teman Guru dari Nol sampai Vercel

Panduan ini ditulis untuk pengguna yang belum terbiasa dengan terminal. Kerjakan sesuai urutan dan jangan melewati bagian Supabase migration.

---

## Bagian A — Persiapan komputer

Pasang aplikasi berikut:

1. **Node.js 22 LTS**.
2. **GitHub Desktop** untuk upload repository dengan cara paling mudah.
3. **Visual Studio Code** atau editor teks lain.
4. Akun GitHub, Supabase, dan Vercel.

Setelah ZIP diekstrak, pastikan kamu melihat file `package.json`, folder `src`, folder `supabase`, dan folder `.github` di dalam folder proyek.

### Tes Node.js

Buka Terminal/PowerShell pada folder proyek lalu jalankan:

```bash
node --version
npm --version
```

Versi Node seharusnya dimulai dengan `v22`.

---

## Bagian B — Buat project Supabase

1. Masuk ke dashboard Supabase.
2. Pilih **New project**.
3. Isi nama project, misalnya `temanguru-production`.
4. Buat password database yang kuat dan simpan di password manager.
5. Pilih region terdekat dengan mayoritas pengguna.
6. Tunggu project selesai dibuat.

Catat dua informasi dari **Project Settings → API**:

- Project URL, bentuknya `https://xxxxx.supabase.co`.
- Publishable key atau anon key. Gunakan key publik, **bukan secret/service-role key**.

Catat juga **Project Ref** dari URL dashboard. Contoh:

```text
https://supabase.com/dashboard/project/abcdefghijk
                                      ^^^^^^^^^^^^ Project Ref
```

---

## Bagian C — Pasang database migration

Cara yang paling aman adalah Supabase CLI karena seluruh migration dijalankan berurutan.

Di Terminal/PowerShell pada folder proyek:

```bash
npm install
npx supabase@latest login
npx supabase@latest link --project-ref PROJECT_REF_KAMU
npx supabase@latest db push --dry-run
npx supabase@latest db push
```

Penjelasan:

- `npm install` memasang dependency aplikasi.
- `login` membuka autentikasi Supabase.
- `link` menyambungkan folder proyek ke project Supabase.
- `db push --dry-run` menampilkan migration yang akan dijalankan tanpa mengubah database.
- `db push` benar-benar memasang seluruh tabel, RLS, RPC, dan tabel sinkronisasi akun.

Saat diminta password database, masukkan password yang dibuat pada Bagian B.

### Hasil yang diharapkan

Tidak ada pesan error merah. Di Supabase Table Editor akan muncul banyak tabel, termasuk:

```text
user_workspace_snapshots
schools
school_members
classes
students
attendance_sessions
```

Jangan menjalankan `supabase db reset --linked` pada production karena perintah itu menghapus data remote.

---

## Bagian D — Atur login email + kata sandi

Buka Supabase:

**Authentication → Providers → Email**

Atur:

- Enable Email provider: **ON**
- Allow new users to sign up: **ON**
- Confirm Email: **OFF**

`Confirm Email` dimatikan agar pengguna dapat daftar lalu langsung masuk tanpa membuka email. Konsekuensinya, alamat email pendaftar tidak diverifikasi saat pendaftaran. Untuk aplikasi sekolah yang sudah ramai, pertimbangkan mengaktifkannya kembali setelah alur verifikasi dibuat.

Anonymous sign-ins tidak diperlukan karena mode tamu menggunakan penyimpanan perangkat, bukan akun anonim Supabase.

---

## Bagian E — Atur OTP untuk lupa kata sandi

Buka:

**Authentication → Email Templates → Reset Password**

Isi subject:

```text
Kode pemulihan Teman Guru
```

Ganti isi template menjadi:

```html
<h2>Kode pemulihan Teman Guru</h2>
<p>Masukkan kode berikut pada halaman lupa kata sandi:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:8px">{{ .Token }}</p>
<p>Kode ini bersifat rahasia dan hanya digunakan satu kali.</p>
<p>Abaikan email ini bila Anda tidak meminta perubahan kata sandi.</p>
```

Yang penting adalah variabel:

```text
{{ .Token }}
```

Jangan hanya memakai `{{ .ConfirmationURL }}`, karena aplikasi ini meminta pengguna mengetik OTP langsung.

### Email production

Untuk percobaan pribadi, mailer bawaan Supabase dapat digunakan. Untuk aplikasi publik, pasang Custom SMTP agar pengiriman email lebih stabil dan menggunakan nama/domain milikmu.

---

## Bagian F — Siapkan konfigurasi lokal

Salin file `.env.example` menjadi `.env.local`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_KEY_KAMU
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
NEXT_PUBLIC_APP_STAGE=development
NEXT_PUBLIC_GIT_COMMIT_SHA=local
```

Jalankan pemeriksaan:

```bash
npm run preflight
npm run dev
```

Buka:

```text
http://localhost:3000
```

Tes minimal:

1. Klik **Buka ruang kerja lokal**.
2. Tambahkan satu kelas dan satu murid.
3. Refresh browser; data harus tetap ada.
4. Unduh backup JSON.
5. Daftar akun memakai email+sandi.
6. Keluar lalu masuk lagi.
7. Coba fitur lupa sandi dan masukkan OTP.

---

## Bagian G — Upload manual ke GitHub dengan GitHub Desktop

Jangan upload ZIP sebagai satu file karena GitHub tidak mengekstraknya menjadi source code.

1. Ekstrak ZIP.
2. Buka GitHub Desktop.
3. Pilih **File → Add Local Repository**.
4. Pilih folder yang berisi `package.json`.
5. Bila muncul pesan bukan Git repository, pilih **Create a repository**.
6. Repository name: misalnya `temanguru`.
7. Pastikan Git ignore: None, karena `.gitignore` sudah tersedia.
8. Klik **Create Repository**.
9. Isi summary commit: `feat: guest-first workspace and password auth`.
10. Klik **Commit to main**.
11. Klik **Publish repository**.
12. Pilih Public atau Private sesuai kebutuhan.

Setelah publish, buka GitHub dan pastikan folder berikut terlihat:

```text
.github
src
supabase
tests
docs
```

---

## Bagian H — Hubungkan GitHub ke Vercel

1. Masuk ke Vercel.
2. Pilih **Add New → Project**.
3. Import repository Teman Guru dari GitHub.
4. Framework seharusnya terdeteksi sebagai **Next.js**.
5. Root Directory biarkan kosong bila `package.json` ada di root repository.
6. Build Command biarkan default `next build`.
7. Install Command biarkan default `npm install`.

Tambahkan environment variables berikut untuk **Production, Preview, dan Development**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_KEY_KAMU
NEXT_PUBLIC_APP_URL=https://NAMA-PROJECT.vercel.app
APP_ALLOWED_ORIGINS=https://NAMA-PROJECT.vercel.app
NEXT_PUBLIC_APP_STAGE=production
NEXT_PUBLIC_GIT_COMMIT_SHA=vercel
```

Jangan menambahkan secret/service-role key ke variabel publik.

Klik **Deploy**.

---

## Bagian I — Atur URL Supabase setelah Vercel selesai

Setelah Vercel memberikan URL final, buka Supabase:

**Authentication → URL Configuration**

Isi:

```text
Site URL:
https://URL-VERCEL-KAMU.vercel.app
```

Tambahkan Redirect URLs:

```text
http://localhost:3000/**
https://URL-VERCEL-KAMU.vercel.app/**
```

Jika domain Vercel berbeda dari nilai `NEXT_PUBLIC_APP_URL`, perbarui environment variable Vercel kemudian lakukan Redeploy.

---

## Bagian J — Checklist setelah deploy

Buka URL production melalui browser biasa dan mode incognito.

### Tanpa login

- Beranda tampil.
- `/workspace` dapat dibuka tanpa diarahkan ke login.
- Kelas dan murid dapat dibuat.
- Refresh tidak menghilangkan data.
- Backup JSON dapat diunduh dan dipulihkan.
- PWA dapat dipasang setelah situs memenuhi syarat browser.

### Dengan akun

- Daftar memakai email+sandi langsung masuk.
- Keluar tidak menghapus data lokal.
- Login di perangkat/browser lain mengambil snapshot cloud.
- Lupa sandi mengirim OTP.
- OTP dapat dipakai untuk membuat kata sandi baru.

### Keamanan

- Tidak ada secret key di GitHub.
- RLS aktif pada `user_workspace_snapshots`.
- Pengguna A tidak dapat membaca snapshot pengguna B.
- HTTPS aktif.

---

## Pemecahan masalah singkat

### Build Vercel gagal saat npm install

Pastikan Node.js pada Vercel mengikuti `package.json` yaitu Node 22, lalu Redeploy tanpa cache.

### Login selalu gagal

Periksa URL dan publishable key di Vercel. Pastikan Email provider aktif.

### Daftar meminta konfirmasi email

Buka Authentication → Providers → Email lalu matikan Confirm Email.

### Email lupa sandi masih berupa link

Template Reset Password belum menggunakan `{{ .Token }}`. Ganti template sesuai Bagian E.

### Sinkronisasi menampilkan error migration

Jalankan kembali:

```bash
npx supabase@latest link --project-ref PROJECT_REF_KAMU
npx supabase@latest db push
```

Pastikan tabel `user_workspace_snapshots` tersedia.

### Data tamu hilang setelah membersihkan browser

Data lokal memang mengikuti penyimpanan browser. Pulihkan dari backup JSON atau login agar snapshot tersimpan di cloud.

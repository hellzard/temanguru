# Cara Menjalankan

## Mode A — Buka paket hybrid langsung

```bash
npm install
npm run setup
npm run dev
```

Lalu jalankan `/bootstrap` di Agent Mode. Agen akan memeriksa apakah Git sudah terhubung ke `hellzard/temanguru`.

## Mode B — Clone repo dahulu

```bash
git clone https://github.com/hellzard/temanguru.git
cd temanguru
```

Salin semua isi paket hybrid ke root repo, pertahankan `.git/`, lalu:

```bash
npm install
npm run setup
npm run verify:workspace
npm run dev
```

Buka repo di Antigravity dan jalankan `/bootstrap`.

## Mode C — Per gelombang

```text
/bootstrap
/plan-wave
/build-feature
/ui-browser-review
/release-audit
```

Untuk rilis:

```text
/github-vercel-publish
```

Gunakan hanya setelah test, build, RLS review, dan Preview smoke test lulus.

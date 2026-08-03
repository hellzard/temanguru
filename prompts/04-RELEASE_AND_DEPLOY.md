Jalankan `/release-audit`. Hanya jika seluruh quality gate lulus, jalankan `/github-vercel-publish`.

Target wajib:
- repo `hellzard/temanguru`;
- branch produksi `main`;
- Vercel project `temanguru`;
- URL `https://temanguru.vercel.app`.

Gunakan Preview terlebih dahulu, lakukan smoke test, lalu production. Jangan pernah commit secret atau `.vercel/`.

---
name: temanguru-release
description: Use this skill for installing, repairing, testing, configuring Supabase auth/RLS, connecting GitHub or Vercel, and deploying the Teman Guru guest-first app.
---

# Teman Guru Release Skill

## Goal

Menyelesaikan release Teman Guru secara aman dan mandiri untuk pengguna nonteknis.

## Contract

- Next.js, TypeScript, Supabase, IndexedDB, PWA.
- `/workspace` tanpa login.
- Login opsional email+sandi.
- Recovery memakai OTP email.
- Backup tamu berupa JSON manual.
- Sync cloud dilindungi RLS.
- AI tetap dinonaktifkan.

## Procedure

1. Baca rules, architecture, auth/sync, dan security model.
2. Audit sebelum mengedit.
3. Buat perubahan kecil, typed, dan teruji.
4. Uji migration/RLS pada Supabase lokal dengan data sintetis.
5. Gunakan Browser Agent untuk flow pengguna dan dashboard cloud.
6. Jangan pernah mengekspos secret.
7. Hasilkan bukti: test, screenshot, SHA, URL, rollback.

## Failure routing

- Build: cek server/client boundary, env, dynamic rendering.
- RLS: cek SQL grants dan policies; jangan nonaktifkan RLS.
- E2E: pastikan lingkungan test dan Supabase lokal aktif.
- Auth: cek provider, Site URL, Redirect URL, template recovery, `verifyOtp`.
- Sync conflict: jangan menimpa data diam-diam.
- Vercel READY tetapi CI merah: release gagal.

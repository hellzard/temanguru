# Teman Guru — Repository Instructions

## Mission

Bangun Teman Guru sebagai web/PWA mobile-first untuk mengurangi pekerjaan administrasi berulang guru dan sekolah Indonesia.

## Canonical references

1. `ANTIGRAVITY_EXECUTION_BRIEF.md`
2. `docs/PRD.md`
3. `docs/MASTER_FEATURE_BLUEPRINT.md`
4. `docs/IMPLEMENTATION_WAVES.md`
5. `docs/ARCHITECTURE.md`
6. `docs/DESIGN_SYSTEM.md`
7. `docs/SECURITY_PRIVACY.md`
8. `docs/ACCEPTANCE_MATRIX.md`
9. `docs/TASKS.md`

## Identitas yang tidak boleh berubah

- Product: `Teman Guru`
- GitHub: `hellzard/temanguru`
- Default branch: `main`
- Vercel project: `temanguru`
- Production URL: `https://temanguru.vercel.app`
- Locale: `id-ID`
- AI: disabled until explicit approval

## Required engineering direction

- Next.js App Router; verify current compatible stable patch before installing.
- React, TypeScript strict, Tailwind CSS, Supabase Auth/Postgres/Storage.
- For Next.js 16 use `proxy.ts`, not legacy `middleware.ts`.
- Prefer Server Components; Client Components only for browser interaction.
- Server Actions/Route Handlers must validate input.
- Every exposed user-owned table must have RLS and tenant checks.
- PWA/offline behavior must be conservative and must not cache private API responses.
- Tests: lint, typecheck, unit, integration where relevant, Playwright E2E, build.
- Mobile target starts at 320 px and must have no horizontal overflow.
- Accessibility target: WCAG 2.2 AA.

## Product rules

- One input should create multiple useful outputs.
- Do not build empty placeholder pages merely to make navigation look complete.
- Do not collect NIK, full address, health data, or family data for MVP.
- Do not claim official integration with Dapodik, e-Rapor, Ruang GTK, PSrE, or WhatsApp.
- Uploaded signatures are `tanda tangan visual`, not certified electronic signatures.
- No AI features before the AI gate is explicitly opened.
- No fake testimonials, usage statistics, or institutional claims.

## Work discipline

1. Inspect before editing.
2. Do not overwrite user work.
3. Work on one vertical slice.
4. Write acceptance criteria before implementation.
5. Add authorization and failure tests.
6. Run quality gate.
7. Verify UI in browser.
8. Update status and decisions.
9. Commit only coherent changes.
10. Push/deploy only after release audit.

## Completion report

Every task report must include:

- changed files;
- migrations;
- tests run and results;
- browser viewports checked;
- security/privacy impact;
- remaining risks;
- next smallest vertical slice.

## Autopilot setup rule

For a fresh workspace, run `/autopilot-setup`. Perform dependency installation, environment setup, Supabase development provisioning, migrations, checks, and browser smoke tests yourself. Do not ask the user to type commands or retrieve values that an authenticated connector can retrieve.

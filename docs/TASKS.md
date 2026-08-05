# Implementation Tasks

Gunakan `docs/IMPLEMENTATION_WAVES.md` sebagai urutan wajib. Centang hanya setelah acceptance criteria, test, browser verification, dan dokumentasi selesai.

## Wave 0 — Foundation and publication
- [x] Starter workspace, rules, skills, agents, workflows, CI/PWA/test scaffold.
- [x] Install dependencies and commit a lockfile.
- [x] Make `npm run verify` pass.
- [x] Confirm env validation and no tracked secrets.
- [ ] Create/push `hellzard/temanguru`.
- [ ] Create Vercel project `temanguru` and pass preview smoke test.

## Wave 1 — Teacher setup
- [x] School/membership onboarding.
- [x] **Slice 2: Academic Year Configuration (Settings)**
  - UI to add academic year (starts_on, ends_on, name).
  - Server Action to enforce only one active academic year per school.
  - UI to switch active academic year.
- [x] **Slice 3: Classes and minimal student records**
  - UI to list and create classes manually.
  - UI to add students manually (display_name, local_code).
- [x] **Slice 4: CSV import preview/validation/rollback**
  - Use Papaparse for client-side robust CSV parsing.
  - Implement a 3-step UI wizard (Upload, Preview Valid/Invalid, Confirm).
  - Bulk upsert/insert students avoiding `local_code` uniqueness crashes via Server Actions.
- [x] **Slice 5: Subjects, teaching assignments, weekly schedule**
  - CRUD Mata Pelajaran di Pengaturan.
  - CRUD Jadwal di halaman Jadwal (otomatis membuat penugasan).
- [x] **Slice 6: Real-data Dashboard Hari Ini**
  - Tampilkan jadwal mengajar pada hari tersebut berdasarkan _Current User_ dan _Active Academic Year_.
  - Hitung agregat murid unik dari kelas yang diampu.

## Wave 2 — Teaching flow
- [x] **Slice 1: Catat Kelas 60 Detik**
- [x] **Slice 2: Follow-up list and monthly recap/export**
- [x] **Slice 3: Offline draft for the slice**

## Wave 3 — Assessment
- [x] Assessment and weighting.
- [x] Mobile score entry and missing-score detection.
- [x] Remedial history.
- [x] Rule-based mastery map.
- [x] XLSX/CSV gradebook export.

## Wave 4 — Offline and mobile classroom
- [x] IndexedDB outbox and idempotent sync.
- [x] Conflict-resolution UI.
- [x] Classroom Focus Mode.
- [x] Seating planner and grouping rules.
- [ ] Substitute teacher pack.

## Wave 5: Teman Guru Docs (PWA Document Studio)

- [x] Create migration `202608050001_document_studio.sql` for `brand_kits`, `document_templates`, `school_documents`, and `visual_assets` with RLS.
- [x] Create storage bucket `teman-guru-assets` and RLS policies for visual signatures and logos.
- [x] Implement `/settings/brand-kit` for letterhead and logo configuration.
- [x] Implement `/documents` index and navigation.
- [x] Implement `/documents/templates/[id]` for constrained template editing with blocks (text, heading, variable, signature).
- [x] Implement `/documents/new` for selecting active templates.
- [x] Implement `/documents/[id]` for variable input and print preview / PDF export.

## Wave 6: Performance, Final Polish & Launch

- [x] Execute comprehensive browser smoke tests (mobile + desktop)
- [x] Accessibility audit (WCAG 2.2 AA)
- [x] Run `quality-gate` checks
- [x] Execute `github-vercel-publish` for deployment

## Wave 7 — Events and meetings
- [x] Event identity, proposal, approval.
- [x] Committee/tasks, budget/realisasi.
- [x] Attendance, certificate batch, LPJ/archive.
- [x] Meeting decisions with PIC/deadline/status.

## Wave 8 — School operations
- [x] Inventory QR and loans.
- [x] Resource booking/conflict constraints.
- [x] Maintenance tickets/history.
- [x] Duty schedules/swaps.

## Wave 9 — Connect and portfolios
- [x] Student evidence portfolio.
- [x] Teacher professional portfolio.
- [x] Parent meeting pack.
- [x] Communication composer with copy/open-WhatsApp.
- [x] Supervision/coaching workflow.

## Wave 10 — Hardening and pilot
- [x] Share Target progressive enhancement.
- [x] Shared-device logout cleanup.
- [ ] Optional passkeys for sensitive roles.
- [x] Accessibility/security/retention review.
- [ ] Backup and restore drill.
- [ ] Pilot with 5–10 teachers.
- [ ] Fix top friction points and publish release notes.

## Continuous requirements
- [ ] RLS tenant-isolation tests for every new table.
- [ ] Keyboard/mobile/empty/error/offline/forbidden states.
- [ ] Audit logs for sensitive actions.
- [ ] Documentation and rollback updated at each release.
- [ ] No AI implementation before Wave 10 completion and explicit approval.

# Implementation Tasks

Gunakan `docs/IMPLEMENTATION_WAVES.md` sebagai urutan wajib. Centang hanya setelah acceptance criteria, test, browser verification, dan dokumentasi selesai.

## Wave 0 — Foundation and publication
- [x] Starter workspace, rules, skills, agents, workflows, CI/PWA/test scaffold.
- [ ] Install dependencies and commit a lockfile.
- [ ] Make `npm run verify` pass.
- [ ] Confirm env validation and no tracked secrets.
- [ ] Create/push `hellzard/temanguru`.
- [ ] Create Vercel project `temanguru` and pass preview smoke test.

## Wave 1 — Teacher setup
- [ ] School/membership onboarding.
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
- [ ] **Slice 3: Offline draft for the slice**

## Wave 3 — Assessment
- [ ] Assessment and weighting.
- [ ] Mobile score entry and missing-score detection.
- [ ] Remedial history.
- [ ] Rule-based mastery map.
- [ ] XLSX/CSV gradebook export.

## Wave 4 — Offline and mobile classroom
- [ ] IndexedDB outbox and idempotent sync.
- [ ] Conflict-resolution UI.
- [ ] Classroom Focus Mode.
- [ ] Seating planner and grouping rules.
- [ ] Substitute teacher pack.

## Wave 5 — Teman Guru Docs
- [ ] Brand kit and secure logo assets.
- [ ] Constrained letterhead/template editor.
- [ ] Variables and print preview.
- [ ] PDF and DOCX export.
- [ ] Visual signature/stamp vault and approval.
- [ ] Numbering, immutable issue record, QR verification.
- [ ] Batch export and document checker.

## Wave 6 — Workflow and archive
- [ ] Surat Tugas workflow vertical slice.
- [ ] Versioned form/workflow definitions.
- [ ] Approval inbox, revisions, comments, audit log.
- [ ] Generic builder after slice validation.
- [ ] Archive classification/search/version/revocation.

## Wave 7 — Events and meetings
- [ ] Event identity, proposal, approval.
- [ ] Committee/tasks, budget/realisasi.
- [ ] Attendance, certificate batch, LPJ/archive.
- [ ] Meeting decisions with PIC/deadline/status.

## Wave 8 — School operations
- [ ] Inventory QR and loans.
- [ ] Resource booking/conflict constraints.
- [ ] Maintenance tickets/history.
- [ ] Duty schedules/swaps.

## Wave 9 — Connect and portfolios
- [ ] Student evidence portfolio.
- [ ] Teacher professional portfolio.
- [ ] Parent meeting pack.
- [ ] Communication composer with copy/open-WhatsApp.
- [ ] Supervision/coaching workflow.

## Wave 10 — Hardening and pilot
- [ ] Share Target progressive enhancement.
- [ ] Shared-device logout cleanup.
- [ ] Optional passkeys for sensitive roles.
- [ ] Accessibility/security/retention review.
- [ ] Backup and restore drill.
- [ ] Pilot with 5–10 teachers.
- [ ] Fix top friction points and publish release notes.

## Continuous requirements
- [ ] RLS tenant-isolation tests for every new table.
- [ ] Keyboard/mobile/empty/error/offline/forbidden states.
- [ ] Audit logs for sensitive actions.
- [ ] Documentation and rollback updated at each release.
- [ ] No AI implementation before Wave 10 completion and explicit approval.

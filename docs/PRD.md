# Product Requirements Document

## Product

**Teman Guru** — PWA produktivitas guru dengan prinsip “catat sekali, keluaran banyak”.

Canonical production URL: `https://temanguru.vercel.app`.

## Problem statement

Guru mengulang data serupa dalam jadwal, presensi, jurnal, penilaian, remedial, laporan, dan komunikasi. Produk harus mengurangi pengulangan tanpa mengklaim menggantikan sistem resmi.

## Primary users

1. Guru mata pelajaran SD–SMA/SMK.
2. Guru kelas SD.
3. Wali kelas.
4. Admin sekolah ringan pada fase lanjut.

## Jobs to be done

- Ketika akan mengajar, saya ingin melihat jadwal dan kebutuhan kelas hari ini.
- Setelah mengajar, saya ingin mencatat presensi dan jurnal kurang dari beberapa menit.
- Saat menilai, saya ingin melihat nilai kosong, remedial, dan perkembangan tanpa spreadsheet rumit.
- Saat sekolah meminta laporan, saya ingin mengekspor data dalam format yang dapat disesuaikan.
- Saat internet tidak stabil, saya ingin pekerjaan tidak hilang.

## Value proposition

Satu rangkaian data menghubungkan jadwal → presensi → jurnal → asesmen → nilai/remedial → laporan.

## MVP scope

### A. Authentication and onboarding

- Email magic link through Supabase Auth.
- Create/join one school workspace.
- Select academic year and teacher role.
- Demo mode for UI preview without Supabase.

### B. School setup

- Classes, subjects, teaching assignments, schedules.
- Student data minimized to display name, optional local code, status.
- CSV import with preview and validation.

### C. Attendance

- Default all present, change exceptions.
- Present/sick/permission/absent/late.
- Notes, session lock, monthly recap, CSV export.
- Idempotent offline draft/sync design.

### D. Teaching journal

- Pre-fill schedule, class, subject, date, and duration.
- Topic, activity summary, reflection, obstacle, follow-up.
- Link attendance session.
- Daily and monthly export.

### E. Assessment and remedial

- Assessment categories and configurable weight.
- Score entry, missing score state, rubric notes.
- Preserve original and remedial attempts.
- Teacher-approved final score policy.

### F. Reports

- Attendance recap.
- Journal recap.
- Grade book.
- Student progress summary.
- CSV first, print/PDF second.

## Not in MVP

- Direct Dapodik/e-Rapor/Ruang GTK login or automation.
- Parent/student accounts.
- WhatsApp Business automation.
- AI-generated final grades.
- Biometric/face attendance.
- Financial/tuition modules.
- Social feed or public student profiles.

## Core acceptance criteria

1. A teacher can complete class setup, attendance, journal, and score entry on a 390 px phone.
2. No screen has horizontal overflow at 320 px.
3. All tenant data is protected by RLS.
4. A non-member cannot read or mutate another school’s records.
5. Student names never appear in analytics, URLs, logs, or cache keys.
6. Drafts survive accidental refresh where implemented.
7. Exports preserve source values and Indonesian characters.
8. Keyboard users can complete every desktop flow.

## Success signals for pilot

Collect only privacy-safe aggregates:

- completed attendance sessions;
- completed journal sessions;
- number of repeated fields auto-filled;
- export completion/error;
- anonymous feature feedback.

Do not claim time savings until measured with consenting pilot teachers.

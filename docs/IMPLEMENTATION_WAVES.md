# Implementation Waves

Setiap wave harus menghasilkan produk yang dapat dipakai dan diuji. Jangan membuka wave berikutnya sebelum exit criteria terpenuhi.

## Wave 0 — Foundation & Deployment

Deliverables:
- dependencies + lockfile
- local build hijau
- Supabase project terhubung
- migrations dan generated types
- GitHub `hellzard/temanguru`
- Vercel project `temanguru`
- preview + production smoke test

Exit criteria: CI hijau, `/api/health` sehat, auth callback teruji.

## Wave 1 — Teacher Core

Vertical slices:
1. onboarding sekolah dan membership
2. kelas + murid + CSV import preview
3. mata pelajaran + jadwal
4. dashboard Hari Ini dari data nyata

Exit criteria: guru baru dapat masuk, membuat kelas, menambah murid, dan melihat jadwal hari ini.

## Wave 2 — Catat Kelas, Presensi, Jurnal

Vertical slices:
1. attendance all-present default
2. exception entry + session lock
3. Catat Kelas 60 Detik
4. journal draft/final + monthly export

Exit criteria: satu sesi mengajar menghasilkan presensi dan jurnal tanpa input ulang.

## Wave 3 — Penilaian & Tindak Lanjut

Vertical slices:
1. assessment + rubric + score entry
2. missing score detection
3. remedial history
4. mastery map berbasis aturan
5. gradebook export

Exit criteria: nilai dapat dimasukkan via HP dan ditindaklanjuti tanpa menghapus histori.

## Wave 4 — Offline & Mobile Classroom

Vertical slices:
1. IndexedDB draft/outbox
2. conflict-safe sync
3. Classroom Focus Mode
4. seating planner + group builder
5. substitute pack

Exit criteria: presensi/jurnal draft tetap berfungsi ketika koneksi putus dan sinkron kembali dengan status jelas.

## Wave 5 — Teman Guru Docs MVP

Vertical slices:
1. Brand Kit Sekolah
2. template + variables
3. PDF preview/export A4/F4
4. logo crop/resize
5. tanda tangan visual/stempel privat
6. surat dan SK MVP
7. DOCX/XLSX/ZIP export

Exit criteria: pengguna dapat membuat satu surat resmi dan satu SK, mengajukan approval, lalu ekspor PDF tanpa layout rusak.

## Wave 6 — Workflow & Archive

Vertical slices:
1. approval request
2. reviewer inbox
3. revision loop
4. document numbering
5. finalization + QR verification
6. archive/search/version

Exit criteria: seluruh lifecycle satu dokumen dapat ditelusuri melalui audit log.

## Wave 7 — Events & Meetings

Vertical slices:
1. event workspace + committee
2. tasks + RAB/realisasi
3. linked documents
4. attendance/certificate batch
5. LPJ package
6. meeting decisions tracker

Exit criteria: satu kegiatan dapat dikelola dari proposal sampai ZIP arsip.

## Wave 8 — School Operations

Vertical slices:
1. inventory + QR
2. borrowing
3. room/equipment booking
4. maintenance tickets
5. duty/substitute schedule

Exit criteria: peminjaman dan booking menolak konflik dan menyimpan histori.

## Wave 9 — Connect & Portfolios

Vertical slices:
1. parent meeting pack
2. communication composer
3. student evidence portfolio
4. teacher portfolio
5. supervision/coaching workflow

Exit criteria: semua data default private dan dapat diekspor dengan izin yang benar.

## Wave 10 — Pilot & Hardening

- accessibility audit
- privacy/data-retention review
- load/performance audit
- backup/restore drill
- 5–10 teacher pilot
- fix top friction points
- publish release notes

## AI gate

AI baru boleh direncanakan setelah Wave 10 dan harus menjadi optional enhancement, bukan dependency.

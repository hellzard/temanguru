# Teman Guru — Autonomous Build Brief

## Outcome

Antigravity harus melanjutkan starter menjadi aplikasi Next.js production-ready yang dapat digunakan untuk pilot kecil guru Indonesia, kemudian mendorongnya ke `hellzard/temanguru` dan men-deploy ke proyek Vercel `temanguru`.

## Product promise

**Catat sekali, dokumen dan tindak lanjut langsung rapi.**

Teman Guru menghubungkan:

- kelas, murid minimum, mapel, jadwal;
- presensi dan Catat Kelas 60 Detik;
- jurnal;
- penilaian, remedial, peta penguasaan;
- laporan dan ekspor;
- Teman Guru Docs;
- workflow persetujuan;
- kegiatan, rapat, inventaris, booking, dan pemeliharaan;
- arsip dan audit;
- offline queue.

## Mandatory reading

1. `docs/AGENT_OPERATING_MODEL.md`
2. `docs/PRD.md`
3. `docs/MASTER_FEATURE_BLUEPRINT.md`
4. `docs/IMPLEMENTATION_WAVES.md`
5. `docs/INFORMATION_ARCHITECTURE.md`
6. `docs/ARCHITECTURE.md`
7. `docs/DATABASE.md`
8. `docs/DATA_MODEL_EXPANSION.md`
9. `docs/DESIGN_SYSTEM.md`
10. `docs/SECURITY_PRIVACY.md`
11. `docs/DOCUMENT_STUDIO_SPEC.md`
12. `docs/WORKFLOW_ENGINE_SPEC.md`
13. `docs/EVENTS_AND_MEETINGS_SPEC.md`
14. `docs/SCHOOL_OPERATIONS_SPEC.md`
15. `docs/ACCEPTANCE_MATRIX.md`
16. `docs/RELEASE_RUNBOOK.md`
17. `docs/TASKS.md`

## Starter baseline

Read `STARTER_CODE_SCOPE.md` before changing code. Preserve working auth, onboarding, PWA safety, tests, schema, and RLS unless a verified migration replaces them.

## Sequence

1. `/bootstrap`
2. `/plan-wave`
3. `/build-feature`
4. `/database-change` when needed
5. `/ui-browser-review`
6. `/release-audit`
7. repeat per slice
8. `/github-vercel-publish` only after release candidate passes

## Non-negotiable quality

A slice is incomplete unless it has:

- real persistence;
- tenant-safe authorization;
- validation;
- loading, empty, error, and success states;
- responsive UI;
- keyboard support;
- test coverage;
- browser evidence;
- status documentation.

## Safety boundaries

- No secrets in repository or browser bundle.
- No service-role key in client.
- No public signature/stamp storage.
- No permanent public signed URLs.
- No identifiable student data in logs.
- No unofficial government login automation.
- No AI until explicit approval.

## Definition of release

- CI green;
- Preview deployment green;
- `/api/health` green;
- auth callback tested;
- RLS negative tests pass;
- 320 px mobile layout passes;
- private route caching reviewed;
- rollback instructions recorded.

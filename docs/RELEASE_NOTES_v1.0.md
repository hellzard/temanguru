# Release Notes v1.0 (MVP) - Teman Guru

**Date:** August 5, 2026
**Version:** 1.0.0

Welcome to the initial stable release of **Teman Guru**, a mobile-first PWA designed to reduce repetitive administrative tasks for Indonesian teachers and schools. 

This v1.0 release completes our "Implementation Waves" and establishes the foundational capabilities of the platform while strictly adhering to our privacy-first principles.

## 🚀 Key Features and Modules

### 1. Identity & Dashboard (Wave 1)
- Seamless Supabase Authentication with Role-Level Security (RLS) ensuring strict multi-tenant data isolation.
- Mobile-first dashboard layout with smooth navigation and adaptive offline-capable UI.
- Secure session management and logout functionality that clears all local caches (IndexedDB, Service Workers, localStorage).

### 2. Assessment & Reporting (Wave 3)
- **Penilaian (Assessment):** Configurable subjects, classes, and assignment types (Tugas, Ulangan, UTS, UAS).
- **Rapor Otomatis:** Automated generation of report cards and student weighting.
- Integrated export to PDF/DOCX capabilities using the Document Studio engine.

### 3. School Operations (Wave 7)
- **Jadwal Piket (Duty):** Track daily teacher duty schedules (morning gate, break time, after-school) with scheduling rotation.
- **Inventaris (Inventory):** Manage school inventory items, QR code tagging, and real-time borrowing capabilities.
- **Maintenance Tickets (Maintenance):** Report facility damages and track repair progress directly from the mobile UI.

### 4. Communication & Connectivity (Wave 9)
- **Komunikasi Orang Tua (Connect):** Quick WhatsApp composer for parent communications with dynamic variables (`{nama_siswa}`, `{status}`) for attendance and notifications.
- **Acara & Kepanitiaan (Events):** Manage school events, timelines, and dynamic committee task lists.
- **Rapat Guru (Meetings):** Schedule internal meetings, record minutes, and track actionable decisions for follow-ups.
- **Portofolio (Portfolios):** Compile teacher achievements, certifications, and project documents for performance reviews.

## 🛠️ Technical Enhancements & Hardening (Wave 10)
- **Zero Lint Errors:** We've refactored the entire codebase to achieve zero ESLint warnings and errors.
- **Strict Typing:** Eradicated the use of `any` types throughout the React Server Components and Client Components in favor of strict `Record<string, unknown>` and concrete interfaces.
- **Improved React Patterns:** Migrated from the deprecated `useActionState` + `useEffect` pattern to `useTransition` and manual `FormData` submission, preventing state-sync errors across all forms (Duty, Inventory, Connect, Events, Meetings, Maintenance, Portfolios).
- **Progressive Web App (PWA):** Fixed manifest typing to ensure proper "Add to Home Screen" installability.

## 🔒 Security & Privacy (By Design)
- All user-owned tables enforce Supabase Row-Level Security (RLS) to ensure teachers and admins can only access their school's data.
- Strict minimization of PII: No NIK, full address, or health data is collected during this MVP phase.
- Private API responses are never cached in the PWA offline layer.

## 📝 Known Limitations
- AI capabilities are currently disabled in the MVP to comply with local directives until the AI gate is explicitly approved.
- Integration with Dapodik, e-Rapor, or Ruang GTK is not officially claimed or supported in this standalone version.

---
*Built with ❤️ for Indonesian Teachers.*

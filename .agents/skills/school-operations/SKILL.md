---
name: school-operations
description: Implements inventory, QR lookup, loans, room/equipment booking, maintenance tickets, and duty schedules for Teman Guru.
---

# School Operations

1. Read `docs/SCHOOL_OPERATIONS_SPEC.md`.
2. Implement one operational vertical slice at a time.
3. Enforce booking conflicts at database level.
4. Preserve asset condition and assignment history.
5. QR pages reveal minimal safe information.
6. Do not add biometric attendance, hidden monitoring, or location tracking.
7. Cover mobile scanning, offline/error state, and role authorization.

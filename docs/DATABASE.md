# Database Model

## Tenancy

`schools` is the tenant. `school_members` links authenticated users to a school with role `owner`, `admin`, or `teacher`. RLS checks active membership.

## Student data minimum

`students` stores only:

- `display_name`
- optional `local_code`
- `status`
- tenant and timestamps

Do not add NIK, full home address, health data, parent data, or biometric data without a separate legal/privacy review.

## Key relationships

```text
schools
 ├─ school_members → profiles
 ├─ academic_years
 ├─ classes ─ class_students ─ students
 ├─ subjects
 ├─ teaching_assignments → schedules
 ├─ attendance_sessions → attendance_records
 ├─ teaching_journals
 └─ assessments → assessment_scores → remedial_attempts
```

## Policy matrix

- Owner/admin: manage school configuration and members.
- Teacher: read school academic setup; manage records for assigned classes.
- All: only within active school memberships.
- Public/anonymous: no tenant data.

Initial SQL is in `supabase/migrations/`. Every new schema change must be a new migration.

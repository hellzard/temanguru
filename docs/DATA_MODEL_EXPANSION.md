# Data Model Expansion

This is a design map, not one giant migration. Add tables per active vertical slice.

## Platform
- `roles`
- `permissions`
- `member_roles`
- `audit_events`
- `notifications`
- `sync_operations`

## Documents
- `school_brand_kits`
- `school_assets`
- `document_templates`
- `document_template_versions`
- `documents`
- `document_versions`
- `document_approvals`
- `document_number_sequences`
- `document_signatures`
- `document_verification_records`
- `archive_classifications`

## Workflow
- `workflow_templates`
- `workflow_template_versions`
- `workflow_steps`
- `workflow_instances`
- `workflow_instance_steps`
- `workflow_comments`
- `workflow_attachments`

## Events & meetings
- `events`
- `event_committees`
- `event_members`
- `event_tasks`
- `event_budget_items`
- `event_expenses`
- `event_attendance`
- `meetings`
- `meeting_attendees`
- `meeting_decisions`

## Operations
- `asset_categories`
- `assets`
- `locations`
- `asset_loans`
- `asset_maintenance`
- `bookable_resources`
- `bookings`
- `maintenance_tickets`
- `duty_types`
- `duty_assignments`

## Portfolios
- `student_evidence_items`
- `teacher_portfolio_items`
- `portfolio_tags`
- `supervision_cycles`
- `supervision_observations`
- `development_goals`

## Mandatory columns

Tenant tables generally require:
- `id uuid primary key`
- `school_id uuid not null`
- `created_at timestamptz`
- `created_by uuid`
- `updated_at timestamptz`
- `updated_by uuid`

Use soft deletion only where recovery/audit requires it. Avoid generic JSONB when typed columns are stable; JSONB is acceptable for versioned template/form schemas with Zod validation.

## RLS test matrix

For every table test:
- outsider cannot read/write
- member can access only allowed school
- teacher cannot execute admin action
- approver can act only on assigned/authorized item
- revoked member loses access
- service role never appears in client code

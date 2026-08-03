# School Operations Specification

## Inventory

Entities:
- asset categories
- assets
- locations
- asset assignments
- loans
- maintenance records
- QR identifiers

Rules:
- QR exposes only a safe lookup page.
- Asset mutation requires authorized school role.
- Condition changes create history, not overwrite-only state.

## Booking

Bookable resources:
- room
- equipment
- vehicle (metadata only; no tracking)

Requirements:
- start/end time
- conflict detection at database level
- optional approval
- purpose and class/event link
- cancellation history

## Maintenance ticket

Fields:
- location/asset
- category
- description
- priority
- photos
- reporter
- assignee
- status
- estimated/actual cost
- before/after evidence

Lifecycle:
`reported → verified → assigned → in_progress → resolved → closed`

## Duty schedule

- duty types
- schedule slots
- assigned staff
- conflicts with teaching schedule
- swap request and approval
- reminder

## Privacy

Operational modules must not become employee-surveillance tools. Do not add continuous location tracking, hidden monitoring, or biometric attendance.

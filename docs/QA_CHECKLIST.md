# QA Checklist

## Functional

- Authentication callback and logout.
- Cross-school access denied.
- Duplicate submissions are idempotent.
- Drafts are not lost on request failure.
- Exports match source filters and values.

## Responsive

- 320×568
- 390×844
- 768×1024
- 1440×900
- no horizontal overflow
- bottom nav not obscured by browser safe area

## Accessibility

- keyboard-only completion
- visible focus
- labels and error descriptions
- icon button names
- 200% zoom
- reduced motion
- status not conveyed by color alone

## Network

- offline shell
- slow 3G/loading states
- request timeout and retry
- duplicate sync
- session expiration

## Privacy

- no student names in URLs/logs/analytics/cache keys
- private pages not cached by service worker
- logout local cleanup
- CSV upload errors do not echo full sensitive rows

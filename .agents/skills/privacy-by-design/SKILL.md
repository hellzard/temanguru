---
name: privacy-by-design
description: Reviews and implements privacy-by-design for minors’ data, logging, analytics, retention, uploads, AI redaction, and consent.
---


# Privacy by Design

- Collect only what the feature needs.
- MVP student profile: display name, optional school-local code, class membership, status.
- Do not request NIK, full address, health data, parent identity, or biometric data.
- Never include student names in logs, analytics events, error trackers, URLs, or filenames.
- AI requests must use redacted identifiers and require teacher review.
- Provide export and deletion/archive paths.
- Document retention and school responsibility clearly.
- Use `docs/SECURITY_PRIVACY.md` as the review checklist.


---
name: data-export
description: Builds reliable CSV, Excel, PDF, print, and backup exports with Indonesian formatting and privacy safeguards.
---


# Data Export

- CSV must use UTF-8 BOM when targeting common Indonesian spreadsheet workflows.
- Dates display in Indonesian locale but machine exports may include ISO dates.
- Preserve raw scores and remedial history; do not silently round source data.
- Include report title, school/class context, period, generation timestamp, and filters.
- Sanitize filenames; never include unnecessary student identifiers.
- Test empty data, special characters, long names, decimal values, and large classes.
- Client-side export is preferred for small datasets; server-side export requires authorization and rate limits.


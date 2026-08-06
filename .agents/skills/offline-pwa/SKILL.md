---
name: offline-pwa
description: Implements safe PWA installation, offline-tolerant forms, IndexedDB queues, connectivity states, and conflict handling.
---


# Offline PWA

- Never cache authenticated HTML or API responses containing student data in the service worker.
- Cache only versioned static assets and the offline shell.
- Store offline drafts in IndexedDB with tenant/user IDs and timestamps.
- Encrypting browser storage is not a substitute for device security; minimize stored data.
- Sync with idempotency keys and show pending/failed/synced status.
- Resolve conflicts explicitly; do not silently overwrite newer server data.
- Test airplane mode, flaky network, tab refresh, duplicate sync, and logout cleanup.


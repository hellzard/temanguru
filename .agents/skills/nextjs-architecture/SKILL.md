---
name: nextjs-architecture
description: Applies Next.js 16 App Router architecture, Server Components, Server Actions, Route Handlers, caching, and proxy conventions.
---


# Next.js Architecture

- Use App Router and `proxy.ts`; never create `middleware.ts`.
- Keep authenticated data fetching on the server.
- Prefer Server Components; isolate client islands.
- Validate mutations with Zod in Server Actions or Route Handlers.
- Do not cache private user HTML or API responses in shared caches.
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` where appropriate.
- Set explicit metadata and accessible document language.
- Run `npm run typecheck` and `npm run build` after routing/config changes.


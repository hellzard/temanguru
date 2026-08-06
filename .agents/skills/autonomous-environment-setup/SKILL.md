---
name: autonomous-environment-setup
description: Menyiapkan toolchain, npm dependencies, .env.local, Supabase development project, migrations, tests, build, dan local browser verification untuk Teman Guru dengan intervensi pengguna minimal.
---
# Autonomous Environment Setup

## Default behavior

The agent performs operational steps itself. It does not turn commands into a tutorial for the user.

## Environment file

- Create `.env.local` from `.env.example` when missing.
- Obtain the Supabase Project URL and publishable key through an authenticated connector or dashboard.
- Write values directly to the file.
- Do not print credential values.
- Do not use service-role/secret keys in browser variables.
- Never commit `.env.local`.

## Dependency installation

- Read `package.json`.
- Use the repository package manager and lockfile.
- Run installation at workspace root.
- Diagnose install failures before changing versions.
- Verify security patches against official package documentation.

## Supabase

- Prefer Supabase MCP/connector.
- Create or select a development project.
- Apply migrations in order.
- Test RLS positive and negative paths.
- Keep production separate from local experimentation.

## Local verification

- Run secret scan, lint, typecheck, unit tests, and build.
- Start the development server in a separate terminal.
- Verify `/`, `/api/health`, login, onboarding, dashboard, and mobile layout.
- Save factual status to `.agent-artifacts` and `docs/IMPLEMENTATION_STATUS.md`.

## User intervention

Ask only for:
- sign-in or OAuth authorization;
- permission for administrator-level installation;
- organization/region/billing decisions that cannot be safely inferred;
- resolving an account policy or quota blocker.

# Deployment Plan

## Fixed targets

- GitHub: `hellzard/temanguru`
- Production branch: `main`
- Vercel project: `temanguru`
- URL: `https://temanguru.vercel.app`

## Preferred path

1. Agent verifies production build locally.
2. Agent pushes a feature branch.
3. Vercel creates a Preview deployment from the connected repository.
4. Agent runs smoke tests against Preview.
5. Agent merges to `main` only after review.
6. Vercel creates the production deployment.
7. Agent verifies `/api/health`, login callback, protected routes, mobile navigation, and critical flows.

## Environment values

Real values belong only in local environment storage, Supabase, or Vercel Environment Variables. Never commit them.

Expected variable names must be documented in `.env.example` after the app is scaffolded.

## Git integration

Vercel automatically creates previews for branch/PR pushes and production deployments for the configured production branch. Link the existing GitHub repository rather than uploading a detached build when possible.

## Release stop conditions

Do not deploy when:

- build or tests fail;
- migration compatibility is unknown;
- secret scan fails;
- RLS tests fail;
- Preview smoke test fails;
- canonical project identity differs.

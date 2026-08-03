# GitHub and Vercel Release Runbook

## Fixed identity

- GitHub: `hellzard/temanguru`
- Default branch: `main`
- Vercel project: `temanguru`
- Production: `https://temanguru.vercel.app`

## GitHub first publication

```bash
git init
git branch -M main
git add .
git commit -m "feat: initialize Teman Guru workspace"
git remote add origin https://github.com/hellzard/temanguru.git
git push -u origin main
```

Never commit `.env.local`, private keys, Supabase service role key, signature/stamp source assets, or `.vercel/` credentials.

## Vercel import

1. Import `hellzard/temanguru`.
2. Project Name must be exactly `temanguru`.
3. Framework preset: Next.js.
4. Root directory: repository root.
5. Add environment variables in Vercel settings, not Git.
6. Deploy preview first.

## Minimum environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL=https://temanguru.vercel.app`

Add server-only values only when a feature requires them. Never prefix a secret with `NEXT_PUBLIC_`.

## Smoke tests

- `/`
- `/login`
- auth callback
- `/dashboard`
- `/api/health`
- installable manifest
- mobile navigation
- no client console secret/error

## Rollback

- Record deployment ID and Git commit.
- Roll back app before destructive database rollback.
- Database migrations must be backward-compatible whenever possible.

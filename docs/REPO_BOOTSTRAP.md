# Repository Bootstrap

Target repository already exists: `hellzard/temanguru`.

## Safe rules

1. Inspect `git status`, remotes, and branch first.
2. Do not delete the initial README without preserving useful content.
3. If working outside a clone, initialize Git and fetch remote before the first push.
4. Reconcile histories safely; never use `git push --force` unless the user explicitly approves.
5. Keep `main` deployable.
6. Prefer feature branches and preview deployment for substantial changes.

## Expected remote

```text
origin https://github.com/hellzard/temanguru.git
```

## Expected production link

```text
GitHub main → Vercel project temanguru → https://temanguru.vercel.app
```

Actual credentials are provided through the user's authenticated tools or local login, never written into files.

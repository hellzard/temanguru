import Link from "next/link";
import { Logo } from "@/components/logo";
import { hasSupabaseEnv } from "@/lib/env";
import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";
import { LoginClient } from "./login-client";

export const metadata = { title: "Masuk atau Daftar", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : null;
  const safeNext = sanitizeInternalPath(rawNext, "/workspace");

  return (
    <main className="min-h-dvh px-4 py-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between"><Logo /><Link href="/workspace" className="text-sm font-bold text-[var(--tg-primary)]">Gunakan tanpa login</Link></div>
      <div className="mx-auto mt-10 grid max-w-5xl place-items-center">
        {!hasSupabaseEnv ? (
          <div className="tg-card w-full max-w-md p-6 sm:p-8"><h1 className="text-2xl font-black">Mode akun belum dikonfigurasi</h1><p className="mt-3 text-sm leading-6 tg-muted">Supabase belum terhubung. Kamu tetap dapat memakai semua fitur lokal dan backup manual.</p><Link href="/workspace" className="tg-primary-button mt-5 w-full">Buka mode lokal</Link></div>
        ) : <LoginClient nextPath={safeNext} />}
      </div>
    </main>
  );
}

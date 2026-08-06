import Link from "next/link";
import { Logo } from "@/components/logo";
import { hasSupabaseEnv } from "@/lib/env";
import { ForgotPasswordClient } from "./forgot-password-client";

export const metadata = { title: "Lupa Kata Sandi", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <main className="min-h-dvh px-4 py-8"><div className="mx-auto flex max-w-5xl items-center justify-between"><Logo /><Link href="/workspace" className="text-sm font-bold text-[var(--tg-primary)]">Mode tanpa login</Link></div><div className="mx-auto mt-10 grid max-w-5xl place-items-center">{hasSupabaseEnv ? <ForgotPasswordClient /> : <div className="tg-card w-full max-w-md p-6"><h1 className="text-2xl font-black">Supabase belum terhubung</h1><p className="mt-3 text-sm tg-muted">Fitur akun dan OTP aktif setelah environment variable Supabase dipasang.</p><Link href="/workspace" className="tg-primary-button mt-5 w-full">Buka mode lokal</Link></div>}</div></main>;
}

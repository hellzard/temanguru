"use client";

import Link from "next/link";
import { Eye, EyeOff, KeyRound, Loader2, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "verify" | "done";

export function ForgotPasswordClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const nextEmail = String(form.get("email") ?? "").trim().toLowerCase();
    try {
      const supabase = createClient();
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(nextEmail);
      if (requestError) throw requestError;
      setEmail(nextEmail);
      setStep("verify");
    } catch {
      setError("Kode belum dapat dikirim. Periksa alamat email atau tunggu sebelum mencoba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function verifyAndReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const token = String(form.get("token") ?? "").replace(/\s/g, "");
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password !== confirmation) {
      setError("Konfirmasi kata sandi tidak sama.");
      setPending(false);
      return;
    }
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
      if (verifyError) throw verifyError;
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      setStep("done");
      window.setTimeout(() => router.replace("/login?next=/workspace"), 1800);
    } catch {
      setError("Kode salah, kedaluwarsa, atau sudah digunakan. Minta kode baru bila perlu.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="tg-card w-full max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-black">Atur ulang kata sandi</h1>
      <p className="mt-2 text-sm leading-6 tg-muted">Kode OTP dikirim ke email. Kamu cukup menyalin kode ke halaman ini—tidak perlu membuka tautan login.</p>
      {error ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</p> : null}

      {step === "email" ? <form onSubmit={requestCode} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Email akun<div className="relative mt-2"><Mail className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} /><input name="email" type="email" required autoComplete="email" className="min-h-12 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] pl-10 pr-3 outline-none focus:border-[var(--tg-primary)]" /></div></label><button disabled={pending} className="tg-primary-button w-full">{pending ? <Loader2 className="animate-spin" size={18} /> : null}Kirim kode OTP</button></form> : null}

      {step === "verify" ? <form onSubmit={verifyAndReset} className="mt-6 space-y-4"><p className="rounded-xl bg-[var(--tg-surface-muted)] p-3 text-sm">Kode dikirim ke <strong>{email}</strong>.</p><label className="block text-sm font-semibold">Kode OTP<div className="relative mt-2"><KeyRound className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} /><input name="token" inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={8} className="min-h-12 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] pl-10 pr-3 text-center text-xl font-black tracking-[0.35em] outline-none focus:border-[var(--tg-primary)]" placeholder="000000" /></div></label><label className="block text-sm font-semibold">Kata sandi baru<div className="relative mt-2"><input name="password" type={showPassword ? "text" : "password"} required minLength={8} maxLength={72} autoComplete="new-password" className="min-h-12 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 pr-12 outline-none focus:border-[var(--tg-primary)]" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-2 grid size-10 place-items-center rounded-lg tg-muted" aria-label="Tampilkan atau sembunyikan kata sandi">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><label className="block text-sm font-semibold">Ulangi kata sandi<input name="confirmation" type={showPassword ? "text" : "password"} required minLength={8} maxLength={72} autoComplete="new-password" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 outline-none focus:border-[var(--tg-primary)]" /></label><button disabled={pending} className="tg-primary-button w-full">{pending ? <Loader2 className="animate-spin" size={18} /> : null}Simpan kata sandi baru</button><button type="button" onClick={() => setStep("email")} className="w-full text-sm font-bold text-[var(--tg-primary)]">Kirim ulang kode</button></form> : null}

      {step === "done" ? <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><p className="font-bold">Kata sandi berhasil diperbarui.</p><p className="mt-1">Kamu akan diarahkan ke halaman masuk.</p></div> : null}
      <Link href="/login?next=/workspace" className="mt-6 block text-center text-sm font-bold text-[var(--tg-primary)]">Kembali ke halaman masuk</Link>
    </div>
  );
}

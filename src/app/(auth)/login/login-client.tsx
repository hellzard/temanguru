"use client";

import Link from "next/link";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

function friendlyError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "Email atau kata sandi salah.";
  if (normalized.includes("email not confirmed")) return "Akun belum aktif. Matikan Confirm email di Supabase agar pendaftaran langsung aktif, atau konfirmasi email terlebih dahulu.";
  if (normalized.includes("user already registered")) return "Email ini sudah terdaftar. Silakan masuk atau gunakan lupa kata sandi.";
  if (normalized.includes("password should be")) return "Kata sandi belum memenuhi ketentuan keamanan.";
  if (normalized.includes("rate limit")) return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  return "Proses akun belum berhasil. Periksa data dan coba kembali.";
}

export function LoginClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const displayName = String(form.get("displayName") ?? "").trim();

    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName || undefined } },
      });
      if (authError) throw authError;
      if (data.session) {
        router.replace(nextPath);
        router.refresh();
      } else {
        setMessage("Akun dibuat, tetapi Supabase masih meminta konfirmasi email. Ikuti panduan ZIP untuk menonaktifkan Confirm email agar pendaftaran langsung masuk.");
      }
    } catch (authError) {
      setError(friendlyError(authError instanceof Error ? authError.message : ""));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="tg-card w-full max-w-md p-6 sm:p-8">
      <div className="grid grid-cols-2 rounded-xl bg-[var(--tg-surface-muted)] p-1">
        <button type="button" onClick={() => { setMode("login"); setError(""); setMessage(""); }} className={`min-h-10 rounded-lg text-sm font-bold ${mode === "login" ? "bg-[var(--tg-surface)] shadow" : "tg-muted"}`}>Masuk</button>
        <button type="button" onClick={() => { setMode("register"); setError(""); setMessage(""); }} className={`min-h-10 rounded-lg text-sm font-bold ${mode === "register" ? "bg-[var(--tg-surface)] shadow" : "tg-muted"}`}>Daftar</button>
      </div>

      <h1 className="mt-6 text-2xl font-black">{mode === "login" ? "Masuk dengan email dan sandi" : "Buat akun sinkronisasi"}</h1>
      <p className="mt-2 text-sm leading-6 tg-muted">
        {mode === "login" ? "Setelah masuk, data lokal dapat tersinkron dan dibuka di perangkat lain." : "Akun hanya diperlukan untuk backup cloud dan perpindahan perangkat. Mode tanpa login tetap tersedia."}
      </p>

      {error ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</p> : null}
      {message ? <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{message}</p> : null}

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "register" ? (
          <label className="block text-sm font-semibold">Nama tampilan
            <div className="relative mt-2"><UserPlus className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} /><input name="displayName" autoComplete="name" maxLength={100} className="min-h-12 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] pl-10 pr-3 outline-none focus:border-[var(--tg-primary)]" placeholder="Nama kamu" /></div>
          </label>
        ) : null}
        <label className="block text-sm font-semibold">Email
          <div className="relative mt-2"><Mail className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} /><input name="email" type="email" autoComplete="email" required className="min-h-12 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] pl-10 pr-3 outline-none focus:border-[var(--tg-primary)]" placeholder="guru@email.com" /></div>
        </label>
        <label className="block text-sm font-semibold">Kata sandi
          <div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} /><input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} maxLength={72} className="min-h-12 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] pl-10 pr-12 outline-none focus:border-[var(--tg-primary)]" placeholder="Minimal 8 karakter" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} className="absolute right-2 top-2 grid size-10 place-items-center rounded-lg tg-muted">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
        </label>
        <button disabled={pending} className="tg-primary-button w-full">{pending ? <Loader2 className="animate-spin" size={18} /> : null}{mode === "login" ? "Masuk" : "Buat akun"}</button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-3 text-sm">
        {mode === "login" ? <Link href="/forgot-password" className="font-bold text-[var(--tg-primary)]">Lupa kata sandi?</Link> : null}
        <Link href="/workspace" className="font-semibold tg-muted">Lanjut tanpa login</Link>
      </div>
    </div>
  );
}

"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-dvh place-items-center px-4"><div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center"><h1 className="text-2xl font-bold text-slate-950">Terjadi kesalahan</h1><p className="mt-3 text-slate-600">Pekerjaanmu tidak akan sengaja dihapus. Coba muat ulang bagian ini.</p><button onClick={reset} className="mt-6 min-h-11 rounded-xl bg-indigo-600 px-4 font-semibold text-white">Coba lagi</button></div></main>;
}

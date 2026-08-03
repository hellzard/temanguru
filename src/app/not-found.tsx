import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-dvh place-items-center px-4 text-center"><div><p className="text-sm font-bold text-indigo-700">404</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Halaman tidak ditemukan</h1><p className="mt-3 text-slate-600">Periksa alamat atau kembali ke beranda.</p><Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-indigo-600 px-4 font-semibold text-white">Kembali</Link></div></main>;
}

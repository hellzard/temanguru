import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = { title: "Ketentuan" };

export default function TermsPage() {
  return <main className="min-h-dvh px-4 py-8 sm:px-6"><article className="mx-auto max-w-3xl"><Logo /><h1 className="mt-10 text-3xl font-black">Ketentuan penggunaan</h1><p className="mt-3 text-sm tg-muted">Terakhir diperbarui: 6 Agustus 2026</p><div className="mt-8 space-y-7 leading-7">
    <section><h2 className="text-xl font-bold">Ruang kerja pendamping</h2><p className="mt-2 tg-muted">Teman Guru membantu pencatatan pribadi dan administrasi sekolah, tetapi bukan pengganti sistem resmi pemerintah, keputusan akademik, atau kebijakan sekolah.</p></section>
    <section><h2 className="text-xl font-bold">Tanggung jawab backup</h2><p className="mt-2 tg-muted">Pengguna tanpa akun bertanggung jawab membuat backup manual. Membersihkan data browser, mengganti perangkat, atau menghapus aplikasi dapat menghilangkan data yang belum dibackup.</p></section>
    <section><h2 className="text-xl font-bold">Keamanan akun</h2><p className="mt-2 tg-muted">Pengguna bertanggung jawab menjaga email, kata sandi, dan kode OTP. Kode OTP tidak boleh dibagikan kepada siapa pun.</p></section>
    <section><h2 className="text-xl font-bold">Deployment mandiri</h2><p className="mt-2 tg-muted">Pemilik deployment bertanggung jawab atas konfigurasi Supabase, SMTP, domain, backup database, pemutakhiran dependency, dan pemenuhan kebijakan sekolah yang berlaku.</p></section>
  </div><Link href="/" className="mt-10 inline-flex font-bold text-[var(--tg-primary)]">Kembali ke beranda</Link></article></main>;
}

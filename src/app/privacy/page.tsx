import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = { title: "Privasi" };

export default function PrivacyPage() {
  return <main className="min-h-dvh px-4 py-8 sm:px-6"><article className="mx-auto max-w-3xl"><Logo /><h1 className="mt-10 text-3xl font-black">Privasi Teman Guru</h1><p className="mt-3 text-sm tg-muted">Terakhir diperbarui: 6 Agustus 2026</p><div className="mt-8 space-y-7 leading-7">
    <section><h2 className="text-xl font-bold">Mode tanpa login</h2><p className="mt-2 tg-muted">Kelas, murid, presensi, jurnal, nilai, dokumen, agenda, dan inventaris disimpan di IndexedDB atau penyimpanan browser perangkat. Data tersebut tidak otomatis dikirim ke server.</p></section>
    <section><h2 className="text-xl font-bold">Backup manual</h2><p className="mt-2 tg-muted">File backup JSON dibuat langsung di browser dan berisi data ruang kerja. File tidak diberi kata sandi, sehingga pengguna harus menyimpannya di lokasi yang aman.</p></section>
    <section><h2 className="text-xl font-bold">Mode akun dan sinkronisasi</h2><p className="mt-2 tg-muted">Email digunakan untuk autentikasi Supabase. Setelah login, snapshot ruang kerja disimpan pada tabel khusus milik pengguna dan dilindungi Row Level Security berdasarkan ID akun.</p></section>
    <section><h2 className="text-xl font-bold">Data minimum</h2><p className="mt-2 tg-muted">Nomor murid dan kontak orang tua bersifat opsional. Hindari memasukkan data sensitif yang tidak diperlukan, seperti NIK, alamat lengkap, informasi kesehatan rinci, atau kata sandi ke dalam catatan.</p></section>
    <section><h2 className="text-xl font-bold">Penghapusan</h2><p className="mt-2 tg-muted">Pengguna dapat menghapus seluruh data lokal melalui menu Backup & Sinkron. Keluar dari akun tidak otomatis menghapus data lokal agar pekerjaan tidak hilang.</p></section>
  </div><Link href="/" className="mt-10 inline-flex font-bold text-[var(--tg-primary)]">Kembali ke beranda</Link></article></main>;
}

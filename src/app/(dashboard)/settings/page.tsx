import Link from "next/link";
import { BookMarked, BriefcaseBusiness, CalendarRange, HardDrive, Paintbrush, Palette } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata = { title: "Pengaturan", robots: { index: false, follow: false } };

const items = [
  { href: "/settings/academic-years", title: "Tahun Ajaran", description: "Atur periode pembelajaran aktif.", icon: CalendarRange },
  { href: "/settings/subjects", title: "Mata Pelajaran", description: "Kelola daftar mata pelajaran sekolah.", icon: BookMarked },
  { href: "/settings/assignments", title: "Penugasan Mengajar", description: "Hubungkan guru, kelas, mapel, dan tahun ajaran.", icon: BriefcaseBusiness },
  { href: "/settings/brand-kit", title: "Brand Kit Sekolah", description: "Identitas untuk dokumen dan cetak.", icon: Paintbrush },
  { href: "/settings/appearance", title: "Tampilan & Tema", description: "Mode gelap, warna, gradasi, atau wallpaper.", icon: Palette },
  { href: "/settings/device", title: "Data Perangkat", description: "Kelola draft offline, cache, tema, dan wallpaper lokal.", icon: HardDrive },
];

export default function SettingsPage() {
  return <div><PageHeader title="Pengaturan" description="Kelola konfigurasi sekolah dan preferensi perangkat." /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(({ href, title, description, icon: Icon }) => <Link key={href} href={href} className="tg-card group flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:border-[var(--tg-primary)]"><span className="grid size-12 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><Icon size={24} /></span><div><h2 className="text-lg font-bold">{title}</h2><p className="mt-1 text-sm tg-muted">{description}</p></div></Link>)}</div></div>;
}

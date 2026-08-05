import Link from "next/link";
import { BookMarked, CalendarRange, Paintbrush, Palette } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata = {
  title: "Pengaturan",
  robots: { index: false, follow: false },
};

const items = [
  {
    href: "/settings/academic-years",
    title: "Tahun Ajaran",
    description: "Atur tahun ajaran aktif dan kelola periode pembelajaran.",
    icon: CalendarRange,
  },
  {
    href: "/settings/subjects",
    title: "Mata Pelajaran",
    description: "Kelola daftar mata pelajaran yang diajarkan di sekolah.",
    icon: BookMarked,
  },
  {
    href: "/settings/brand-kit",
    title: "Brand Kit Sekolah",
    description: "Atur logo, warna, dan templat kop surat resmi sekolah.",
    icon: Paintbrush,
  },
  {
    href: "/settings/appearance",
    title: "Tampilan & Tema",
    description: "Pilih mode gelap, warna solid, gradasi, atau wallpaper pribadi.",
    icon: Palette,
  },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Pengaturan" description="Kelola konfigurasi sekolah dan preferensi Anda." />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="tg-card group flex flex-col gap-4 p-6 hover:border-[var(--tg-primary)]">
            <span className="grid size-12 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]">
              <Icon size={24} />
            </span>
            <div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-1 text-sm tg-muted">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

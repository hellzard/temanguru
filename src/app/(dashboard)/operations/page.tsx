import Link from "next/link";
import { CalendarCheck2, ChevronRight, PackageSearch, Wrench } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

const modules = [
  { href: "/operations/inventory", title: "Inventaris", description: "Barang, ketersediaan, peminjaman atomik, dan pengembalian.", icon: PackageSearch },
  { href: "/operations/maintenance", title: "Pemeliharaan", description: "Laporkan kerusakan dan pantau tindak lanjut fasilitas.", icon: Wrench },
  { href: "/operations/duty", title: "Jadwal Piket", description: "Atur tugas harian dan status pelaksanaan anggota sekolah.", icon: CalendarCheck2 },
];

export const metadata = { title: "Operasional" };
export default function OperationsPage() {
  return <div><PageHeader title="Operasional Sekolah" description="Kelola fasilitas dan tugas rutin dalam ruang kerja yang sama."/><div className="mt-7 grid gap-4 md:grid-cols-3">{modules.map(({href,title,description,icon:Icon})=><Link key={href} href={href} className="tg-card group p-6 hover:border-[var(--tg-primary)]"><div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><Icon size={23}/></span><ChevronRight className="tg-muted transition group-hover:translate-x-1" size={20}/></div><h2 className="mt-5 text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">{title}</h2><p className="mt-2 text-sm leading-6 tg-muted">{description}</p></Link>)}</div></div>;
}

import {
  BookOpenText,
  CalendarDays,
  CalendarRange,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  MessageCircleMore,
  PackageSearch,
  Settings,
  Users,
  Video,
} from "lucide-react";

export const dashboardNavigation = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, group: "Utama" },
  { href: "/record", label: "Catat Kelas", icon: ClipboardCheck, group: "Utama" },
  { href: "/classes", label: "Kelas", icon: GraduationCap, group: "Utama" },
  { href: "/students", label: "Murid", icon: Users, group: "Utama" },
  { href: "/assessment", label: "Penilaian", icon: ChartNoAxesColumnIncreasing, group: "Akademik" },
  { href: "/journal", label: "Jurnal", icon: BookOpenText, group: "Akademik" },
  { href: "/documents", label: "Dokumen", icon: FileText, group: "Akademik" },
  { href: "/events", label: "Acara", icon: CalendarRange, group: "Sekolah" },
  { href: "/meetings", label: "Rapat", icon: Video, group: "Sekolah" },
  { href: "/operations", label: "Operasional", icon: PackageSearch, group: "Sekolah" },
  { href: "/portfolios", label: "Portofolio", icon: FolderKanban, group: "Sekolah" },
  { href: "/connect", label: "Connect", icon: MessageCircleMore, group: "Sekolah" },
  { href: "/schedule", label: "Jadwal", icon: CalendarDays, group: "Sekolah" },
  { href: "/settings", label: "Pengaturan", icon: Settings, group: "Lainnya" },
] as const;

export const dashboardNavigationGroups = Array.from(
  new Set(dashboardNavigation.map((item) => item.group)),
);

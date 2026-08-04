import {
  Award,
  BookOpen,
  CalendarDays,
  FileCheck2,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  Settings,
  Users,
} from "lucide-react";

export const dashboardNavigation = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/classes", label: "Kelas", icon: GraduationCap },
  { href: "/attendance", label: "Presensi", icon: FileCheck2 },
  { href: "/journal", label: "Jurnal", icon: BookOpen },
  { href: "/students", label: "Murid", icon: Users },
  { href: "/record", label: "Catat Kelas", icon: FileCheck2 },
  { href: "/assessment", label: "Penilaian", icon: FileSpreadsheet },
  { href: "/grades", label: "Buku Nilai", icon: Award },
  { href: "/recap", label: "Rekap & Tindak Lanjut", icon: ListTodo },
  { href: "/schedules", label: "Jadwal", icon: CalendarDays },
  { href: "/settings", label: "Pengaturan", icon: Settings },
] as const;

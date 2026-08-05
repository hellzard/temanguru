import { PageHeader } from "@/components/dashboard/page-header";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";

export const metadata = {
  title: "Tampilan & Tema",
  robots: { index: false, follow: false },
};

export default function AppearancePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Tampilan & Tema"
        description="Pilih warna, gradasi, mode gelap, atau wallpaper favorit Anda." />
      <div className="mt-8"><ThemeCustomizer /></div>
    </div>
  );
}

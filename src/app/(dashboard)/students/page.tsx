import { FeaturePlaceholder } from "@/components/dashboard/feature-placeholder";

export const metadata = { title: "Murid" };

export default function Page() {
  return <FeaturePlaceholder title="Murid" description="Simpan data minimum yang benar-benar dibutuhkan untuk kegiatan kelas." next="Bangun daftar murid dan CSV import preview tanpa NIK, alamat, atau data sensitif." />;
}

import { PageHeader } from "@/components/dashboard/page-header";
import { DeviceDataClient } from "./device-data-client";

export const metadata = { title: "Data Perangkat" };

export default function DeviceDataPage() {
  return <div className="mx-auto max-w-2xl"><PageHeader title="Data Perangkat" description="Kelola draft offline, cache aplikasi, tema, dan wallpaper yang tersimpan hanya pada browser ini." /><section className="tg-card mt-7 p-5 sm:p-7"><DeviceDataClient /></section></div>;
}

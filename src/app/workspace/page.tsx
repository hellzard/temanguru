import type { Metadata } from "next";
import { WorkspaceApp } from "@/components/workspace/workspace-app";
import { WorkspaceProvider } from "@/lib/workspace/workspace-provider";

export const metadata: Metadata = {
  title: "Ruang Kerja Lokal",
  description: "Gunakan Teman Guru tanpa login, simpan data di perangkat, backup manual, atau sinkron antarperangkat dengan akun.",
  robots: { index: false, follow: false },
};

export default function WorkspacePage() {
  return <WorkspaceProvider><WorkspaceApp /></WorkspaceProvider>;
}

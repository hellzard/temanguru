import { redirect } from "next/navigation";

export const metadata = { title: "Buku Nilai" };

export default function GradesPage() {
  redirect("/assessment");
}

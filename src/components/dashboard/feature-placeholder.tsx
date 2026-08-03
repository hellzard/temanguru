import { ArrowRight, Construction } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";

export function FeaturePlaceholder({ title, description, next }: { title: string; description: string; next: string }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <Badge tone="warning">Starter workspace</Badge>
        <div className="mt-5 grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-700"><Construction aria-hidden="true" /></div>
        <h2 className="mt-5 text-xl font-bold text-slate-950">Vertical slice berikutnya</h2>
        <p className="mt-2 max-w-xl text-slate-600">{next}</p>
        <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-indigo-700"><ArrowRight size={16} aria-hidden="true" />Jalankan workflow /build-feature di Antigravity.</p>
      </section>
    </div>
  );
}

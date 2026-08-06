"use client";

import { Printer, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";

type Student = { id: string; name: string; code: string | null };

function shuffle<T>(source: T[]) {
  const result = [...source];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1));
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
}

export function GroupBuilderClient({ students }: { students: Student[] }) {
  const [groupSize, setGroupSize] = useState(Math.min(4, Math.max(2, students.length)));
  const [order, setOrder] = useState(() => students);
  const groups = useMemo(() => {
    const count = Math.max(1, Math.ceil(order.length / groupSize));
    const result: Student[][] = Array.from({ length: count }, () => []);
    order.forEach((student, index) => result[index % count].push(student));
    return result;
  }, [groupSize, order]);

  return <div><div className="tg-card flex flex-col gap-4 p-5 sm:flex-row sm:items-end"><label className="block flex-1 text-sm font-bold">Murid per kelompok<input type="number" min="2" max="10" value={groupSize} onChange={(event) => setGroupSize(Math.min(10, Math.max(2, Number(event.target.value) || 2)))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><button onClick={() => setOrder(shuffle(students))} className="tg-primary-button"><Shuffle size={17} />Acak ulang</button><button onClick={() => window.print()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--tg-border)] px-4 font-bold"><Printer size={17} />Cetak</button></div><section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{groups.map((group, index) => <article key={index} className="tg-card p-5"><h2 className="font-black text-[var(--tg-primary)]">Kelompok {index + 1}</h2><ol className="mt-4 space-y-2">{group.map((student) => <li key={student.id} className="rounded-xl bg-[var(--tg-surface-muted)] px-3 py-2"><span className="font-semibold">{student.name}</span>{student.code ? <span className="ml-2 text-xs tg-muted">{student.code}</span> : null}</li>)}</ol></article>)}</section></div>;
}

"use client";

import { Maximize2, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

type Student = { id: string; name: string };

export function FocusClient({ students }: { students: Student[] }) {
  const [current, setCurrent] = useState<Student | null>(null);
  const [remaining, setRemaining] = useState(students);
  const progress = useMemo(() => students.length - remaining.length, [students.length, remaining.length]);

  function pick() {
    if (!remaining.length) return;
    const index = Math.floor(Math.random() * remaining.length);
    setCurrent(remaining[index]);
    setRemaining(remaining.filter((_, itemIndex) => itemIndex !== index));
  }

  function reset() {
    setCurrent(null);
    setRemaining(students);
  }

  return <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center"><p className="text-sm font-bold tg-muted">{progress} dari {students.length} murid sudah dipilih</p><div className="mt-6 grid min-h-52 w-full max-w-3xl place-items-center rounded-[2rem] border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] p-8 shadow-xl"><h2 className="text-4xl font-black sm:text-6xl">{current?.name ?? "Siap memilih murid"}</h2></div><div className="mt-7 flex flex-wrap justify-center gap-3"><button onClick={pick} disabled={!remaining.length} className="tg-primary-button min-w-48 disabled:opacity-50"><Maximize2 size={18} />{current ? "Pilih berikutnya" : "Pilih murid"}</button><button onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--tg-border)] px-4 font-bold"><RotateCcw size={17} />Reset</button></div><p className="mt-5 max-w-xl text-sm tg-muted">Pilihan tidak disimpan. Mode ini membantu pemerataan kesempatan menjawab tanpa membuat profil perilaku murid.</p></div>;
}

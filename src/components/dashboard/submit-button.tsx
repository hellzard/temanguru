"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className = "tg-primary-button" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : null}
      {pending ? "Menyimpan…" : children}
    </button>
  );
}

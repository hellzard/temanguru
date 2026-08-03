import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600",
  secondary: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 focus-visible:outline-indigo-600",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:outline-indigo-600",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
};

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border border-transparent bg-[linear-gradient(135deg,var(--tg-primary),var(--tg-primary-strong))] text-white shadow-[var(--tg-shadow-glow)] hover:brightness-110 hover:shadow-[var(--tg-shadow-glow-lg)] hover:-translate-y-px active:translate-y-0 active:brightness-95",
  secondary:
    "border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] text-[var(--tg-text)] backdrop-blur-sm hover:border-[color-mix(in_srgb,var(--tg-primary)_40%,var(--tg-border))] hover:bg-[var(--tg-primary-softer)]",
  ghost:
    "border border-transparent text-[var(--tg-text-muted)] hover:bg-[var(--tg-primary-soft)] hover:text-[var(--tg-primary)]",
  danger:
    "border border-transparent bg-[linear-gradient(135deg,#e11d48,#be123c)] text-white shadow-[0_10px_24px_-8px_rgba(225,29,72,0.55)] hover:brightness-110 hover:-translate-y-px active:translate-y-0 active:brightness-95",
} as const;

const sizes = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-6 text-base",
} as const;

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold transition-all duration-200 ease-[var(--tg-ease)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tg-ring)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 active:scale-[0.98]",
        sizes[size],
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

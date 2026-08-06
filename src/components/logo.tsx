import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Teman Guru — Beranda"
      className="group inline-flex min-h-11 items-center gap-3 rounded-xl focus-visible:outline-none"
    >
      <span
        aria-hidden="true"
        className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-[linear-gradient(145deg,#6d5dfc_0%,#4f46e5_52%,#0f766e_145%)] text-white shadow-[0_12px_30px_-12px_rgba(79,70,229,.9)] transition duration-300 group-hover:-rotate-2 group-hover:scale-[1.04]"
      >
        <svg viewBox="0 0 40 40" className="size-7" fill="none">
          <path
            d="M8.5 11.5c4.7-.3 8.2 1.1 11.5 4.1v14c-3.3-3-6.8-4.4-11.5-4.1v-14Z"
            fill="currentColor"
            fillOpacity=".96"
          />
          <path
            d="M31.5 11.5c-4.7-.3-8.2 1.1-11.5 4.1v14c3.3-3 6.8-4.4 11.5-4.1v-14Z"
            fill="currentColor"
            fillOpacity=".76"
          />
          <path
            d="m15.1 20.2 2.3 2.2 5.6-5.6"
            stroke="#FDE68A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute inset-x-1 top-0 h-px bg-white/60" />
      </span>

      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-[family-name:var(--font-display)] text-[16px] font-extrabold tracking-[-0.03em] text-[var(--tg-text)]">
            Teman Guru
          </span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--tg-text-muted)]">
            Ruang kerja harian
          </span>
        </span>
      )}
    </Link>
  );
}

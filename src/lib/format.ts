export function formatDate(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", options ?? { dateStyle: "medium" }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined) {
  return formatDate(value, { dateStyle: "medium", timeStyle: "short" });
}

export function formatCurrency(value: number | string | null | undefined) {
  const amount = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TG";
}

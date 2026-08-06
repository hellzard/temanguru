export function relationObject(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) return relationObject(value[0]);
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

export function relationText(value: unknown, key = "name", fallback = "—"): string {
  const object = relationObject(value);
  const result = object?.[key];
  return typeof result === "string" && result.trim() ? result : fallback;
}

const identifierKeys = new Set(["studentName", "displayName", "localCode", "schoolName", "email"]);

export function redactForAi(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [identifierKeys.has(key) ? key : key, identifierKeys.has(key) ? "[DIHAPUS]" : value]),
  );
}

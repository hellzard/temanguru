export function createCsv(rows: Array<Record<string, string | number | null>>) {
  if (rows.length === 0) return "\uFEFF";
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };
  const body = [headers.map(escape).join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))];
  return `\uFEFF${body.join("\r\n")}`;
}

export function safeFilename(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80) || "temanguru-export";
}

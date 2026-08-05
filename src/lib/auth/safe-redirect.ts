const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;

export function sanitizeInternalPath(
  value: string | null | undefined,
  fallback = "/onboarding",
): string {
  if (!value) return fallback;

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    CONTROL_CHARACTERS.test(decoded)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(decoded, "https://temanguru.invalid");
    if (parsed.origin !== "https://temanguru.invalid") return fallback;
    if (parsed.pathname === "/auth/callback") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function resolveTrustedOrigin(requestOrigin?: string | null): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  const configuredOrigin = configured ? normalizeOrigin(configured) : null;
  const allowed = new Set(
    (process.env.APP_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((entry) => normalizeOrigin(entry.trim()))
      .filter((entry): entry is string => Boolean(entry)),
  );

  if (configuredOrigin) allowed.add(configuredOrigin);
  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }

  const candidate = requestOrigin ? normalizeOrigin(requestOrigin) : null;
  if (candidate && allowed.has(candidate)) return candidate;
  if (configuredOrigin) return configuredOrigin;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";

  throw new Error("NEXT_PUBLIC_APP_URL belum dikonfigurasi dengan origin production yang valid.");
}

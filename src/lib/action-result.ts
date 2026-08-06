import { redirect } from "next/navigation";

export function redirectWithMessage(path: string, kind: "success" | "error", message: string): never {
  const url = new URL(path, "https://temanguru.local");
  url.searchParams.set(kind, message.slice(0, 180));
  redirect(`${url.pathname}${url.search}`);
}

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const protectedPrefixes = [
    "/onboarding", "/dashboard", "/classes", "/attendance", "/journal",
    "/grades", "/students", "/schedule", "/schedules", "/settings",
    "/events", "/meetings", "/operations", "/portfolios", "/connect",
    "/record", "/recap", "/assessment", "/documents", "/school",
  ];
  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (isProtected && !data?.claims) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set(
      "next",
      sanitizeInternalPath(
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
        "/dashboard",
      ),
    );
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "temanguru",
      stage: process.env.NEXT_PUBLIC_APP_STAGE ?? process.env.VERCEL_ENV ?? "development",
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ?? "local",
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

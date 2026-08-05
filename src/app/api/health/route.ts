export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "temanguru",
      stage: process.env.NEXT_PUBLIC_APP_STAGE ?? "unknown",
      commit: process.env.VERCEL_GIT_COMMIT_SHA
        ?? process.env.NEXT_PUBLIC_GIT_COMMIT_SHA
        ?? "unknown",
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://temanguru.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms"],
        disallow: [
          "/dashboard", "/onboarding", "/school", "/classes", "/attendance",
          "/journal", "/grades", "/students", "/schedule", "/schedules",
          "/settings", "/events", "/meetings", "/operations", "/portfolios",
          "/connect", "/record", "/recap", "/assessment", "/documents", "/auth",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://temanguru.vercel.app";
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/privacy`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/terms`, changeFrequency: "monthly", priority: 0.4 },
  ];
}

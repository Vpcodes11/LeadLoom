import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: ["/", "/terms", "/privacy"], disallow: ["/app/", "/review/", "/invite/", "/reset-password/", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/settings/", "/login", "/auth/", "/deals/new", "*/edit"],
    },
    sitemap: "https://halasaves.com/sitemap.xml",
  };
}

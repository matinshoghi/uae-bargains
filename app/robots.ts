import type { MetadataRoute } from "next";
import { AI_BOT_USER_AGENTS, BASE_URL } from "@/lib/site";

const DISALLOW_PATHS = ["/admin/", "/settings/", "/login", "/auth/", "/deals/new", "*/edit"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [...AI_BOT_USER_AGENTS],
        allow: "/",
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW_PATHS,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

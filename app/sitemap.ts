import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { BASE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Fetch all non-removed deals (active + expired)
  const { data: deals } = await supabase
    .from("deals")
    .select("id, updated_at")
    .neq("status", "removed")
    .order("created_at", { ascending: false });

  const dealEntries: MetadataRoute.Sitemap = (deals ?? []).map((deal) => ({
    url: `${BASE_URL}/deals/${deal.id}`,
    lastModified: deal.updated_at,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/llms.txt`,
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ];

  return [...staticPages, ...dealEntries];
}

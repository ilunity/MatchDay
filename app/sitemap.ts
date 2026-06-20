import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";
import { getPublicEventsForSitemap } from "@/lib/public-events";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl("/"),
    changeFrequency: "weekly",
    priority: 1,
  };

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/how-it-works"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const publicEvents = await getPublicEventsForSitemap();

    return [
      homeEntry,
      ...staticPages,
      ...publicEvents.map((event) => ({
        url: absoluteUrl(`/e/${event.slug}`),
        lastModified: new Date(event.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return [homeEntry, ...staticPages];
  }
}

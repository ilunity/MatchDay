import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
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
}

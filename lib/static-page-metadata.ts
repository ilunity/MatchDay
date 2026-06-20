import type { Metadata } from "next";
import {
  absoluteUrl,
  buildHomeOgImages,
  defaultOpenGraph,
  defaultTwitter,
  getOgImageUrls,
} from "@/lib/metadata";

export function buildStaticPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);
  const images = buildHomeOgImages();
  const imageUrls = getOgImageUrls(images);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...defaultOpenGraph,
      title,
      description,
      url,
      images,
    },
    twitter: {
      ...defaultTwitter,
      title,
      description,
      images: imageUrls,
    },
  };
}

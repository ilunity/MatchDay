import type { MetadataRoute } from "next";
import { ru } from "@/lib/i18n/ru";
import { OG_COLORS } from "@/lib/og-image";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ru.appName,
    short_name: ru.appName,
    description: ru.description,
    start_url: "/",
    display: "standalone",
    background_color: OG_COLORS.background,
    theme_color: OG_COLORS.primary,
    lang: "ru",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

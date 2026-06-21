import { ru } from "@/lib/i18n/ru";
import { absoluteUrl } from "@/lib/metadata";

type JsonLdGraph = Record<string, unknown>;

export function buildHomeJsonLd(): JsonLdGraph {
  const url = absoluteUrl("/");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: ru.appName,
        url,
        description: ru.description,
        inLanguage: "ru-RU",
      },
      {
        "@type": "Organization",
        name: ru.appName,
        url,
      },
    ],
  };
}

import type { IEvent } from "@/models/Event";
import { ru } from "@/lib/i18n/ru";
import { absoluteUrl, storagePublicUrl, truncateDescription } from "@/lib/metadata";

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

export function buildEventJsonLd(
  event: Pick<
    IEvent,
    "slug" | "title" | "description" | "coverImageKey" | "possibleDates"
  >
): JsonLdGraph {
  const url = absoluteUrl(`/e/${event.slug}`);
  const description = event.description?.trim()
    ? truncateDescription(event.description)
    : ru.og.eventDescriptionFallback(event.title);

  const jsonLd: JsonLdGraph = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description,
    url,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: "ru-RU",
  };

  if (event.coverImageKey) {
    jsonLd.image = storagePublicUrl(event.coverImageKey);
  }

  const dates = event.possibleDates
    .map((date) => new Date(date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length > 0) {
    jsonLd.startDate = dates[0].toISOString();
    jsonLd.endDate = dates[dates.length - 1].toISOString();
  }

  return jsonLd;
}

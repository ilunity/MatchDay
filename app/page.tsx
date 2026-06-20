import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CalendarPlus, LayoutDashboard, Link2 } from "lucide-react";
import { FeatureCard } from "@/components/feature-card";
import { JsonLd } from "@/components/json-ld";
import { auth } from "@/lib/auth";
import { buildHomeJsonLd } from "@/lib/json-ld";
import { ru } from "@/lib/i18n/ru";
import {
  absoluteUrl,
  buildHomeOgImages,
  defaultOpenGraph,
  defaultTwitter,
  getOgImageUrls,
} from "@/lib/metadata";
import { Button } from "@/components/ui/button";

const homeDescription = ru.og.homeDescription;
const homeImages = buildHomeOgImages();
const homeImageUrls = getOgImageUrls(homeImages);

export const metadata: Metadata = {
  title: { absolute: ru.appName },
  description: homeDescription,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    ...defaultOpenGraph,
    title: ru.appName,
    description: homeDescription,
    url: absoluteUrl("/"),
    images: homeImages,
  },
  twitter: {
    ...defaultTwitter,
    title: ru.appName,
    description: homeDescription,
    images: homeImageUrls,
  },
};

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <JsonLd data={buildHomeJsonLd()} />
      <div className="container px-4 py-12 sm:py-20">
        <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {ru.heroTitle}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{ru.heroSubtitle}</p>
        <div className="mx-auto mt-8 grid w-full max-w-sm gap-3 sm:max-w-md sm:grid-cols-2">
          {session ? (
            <>
              <Link href="/events/new" className="w-full">
                <Button className="w-full">
                  <CalendarPlus className="h-4 w-4" />
                  {ru.createEvent}
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">
                  <LayoutDashboard className="h-4 w-4" />
                  {ru.dashboard}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login?callbackUrl=/events/new" className="w-full">
                <Button className="w-full">
                  <CalendarPlus className="h-4 w-4" />
                  {ru.getStarted}
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  {ru.login}
                </Button>
              </Link>
            </>
          )}
        </div>
        </section>

        <section className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
        <FeatureCard
          variant="create"
          icon={CalendarPlus}
          title={ru.features.create}
          description={ru.features.createDesc}
        />
        <FeatureCard
          variant="share"
          icon={Link2}
          title={ru.features.share}
          description={ru.features.shareDesc}
        />
        <FeatureCard
          variant="results"
          icon={BarChart3}
          title={ru.features.results}
          description={ru.features.resultsDesc}
        />
        </section>
      </div>
    </>
  );
}

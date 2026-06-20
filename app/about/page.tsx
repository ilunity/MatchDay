import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { ru } from "@/lib/i18n/ru";
import { buildStaticPageMetadata } from "@/lib/static-page-metadata";
import { Button } from "@/components/ui/button";

export const metadata = buildStaticPageMetadata({
  title: ru.aboutPage.title,
  description: ru.aboutPage.metaDescription,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container max-w-3xl px-4 py-10 md:py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {ru.aboutPage.title}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">{ru.aboutPage.intro}</p>

      <div className="mt-10 space-y-8">
        {ru.aboutPage.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/how-it-works">
          <Button variant="outline">{ru.howItWorks}</Button>
        </Link>
        <Link href="/login?callbackUrl=/events/new">
          <Button>
            <CalendarPlus className="h-4 w-4" />
            {ru.getStarted}
          </Button>
        </Link>
      </div>
    </div>
  );
}

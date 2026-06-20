import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { ru } from "@/lib/i18n/ru";
import { buildStaticPageMetadata } from "@/lib/static-page-metadata";
import { Button } from "@/components/ui/button";

export const metadata = buildStaticPageMetadata({
  title: ru.howItWorksPage.title,
  description: ru.howItWorksPage.metaDescription,
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <div className="container max-w-3xl px-4 py-10 md:py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {ru.howItWorksPage.title}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {ru.howItWorksPage.intro}
      </p>

      <ol className="mt-10 space-y-8">
        {ru.howItWorksPage.steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <div>
              <h2 className="text-xl font-semibold">{step.title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/about">
          <Button variant="outline">{ru.about}</Button>
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

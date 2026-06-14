"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { formatDateShortRu } from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EventDashboardCardProps = {
  slug: string;
  title: string;
  createdAt: Date;
  possibleDatesCount: number;
  requireAuth: boolean;
};

export function EventDashboardCard({
  slug,
  title,
  createdAt,
  possibleDatesCount,
  requireAuth,
}: EventDashboardCardProps) {
  const router = useRouter();

  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/e/${slug}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/e/${slug}`);
        }
      }}
      className="relative cursor-pointer transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Link
        href={`/events/${slug}/edit`}
        aria-label={ru.edit}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Pencil className="h-4 w-4" />
      </Link>

      <CardHeader className="pr-12">
        <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {ru.createdAt}: {formatDateShortRu(createdAt)}
        </p>
      </CardHeader>
      <CardContent className="mt-auto">
        <p className="text-sm text-muted-foreground">
          {possibleDatesCount} возможных дат
          {requireAuth && " · только для зарегистрированных"}
        </p>
      </CardContent>
    </Card>
  );
}

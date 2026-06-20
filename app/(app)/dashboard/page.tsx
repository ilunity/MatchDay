import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import {
  getDashboardEvents,
  type DashboardEventFilter,
} from "@/actions/events";
import { DashboardEventFilter as DashboardEventFilterBar } from "@/components/dashboard-event-filter";
import { EventDashboardCard } from "@/components/event-dashboard-card";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PageProps = {
  searchParams: Promise<{ filter?: string }>;
};

function parseFilter(value: string | undefined): DashboardEventFilter {
  if (value === "owned" || value === "participated") return value;
  return "all";
}

function emptyMessage(filter: DashboardEventFilter): string {
  if (filter === "owned") return ru.noOwnedEvents;
  if (filter === "participated") return ru.noParticipatedEvents;
  return ru.noEvents;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { filter: filterParam } = await searchParams;
  const filter = parseFilter(filterParam);
  const events = await getDashboardEvents(filter);

  return (
    <div className="container px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{ru.myEvents}</h1>
          <p className="text-muted-foreground">{ru.dashboard}</p>
        </div>
        <Link href="/events/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <CalendarPlus className="h-4 w-4" />
            {ru.createEvent}
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <DashboardEventFilterBar active={filter} />
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">{emptyMessage(filter)}</p>
            {filter !== "participated" && (
              <Link href="/events/new">
                <Button>
                  <CalendarPlus className="h-4 w-4" />
                  {ru.createFirst}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventDashboardCard
              key={event._id.toString()}
              slug={event.slug}
              title={event.title}
              createdAt={new Date(event.createdAt)}
              possibleDatesCount={event.possibleDates.length}
              confirmedDatesCount={event.confirmedDates?.length ?? 0}
              requireAuth={event.requireAuth}
              isOwner={event.role === "owner"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

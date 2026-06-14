import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { getUserEvents } from "@/actions/events";
import { EventDashboardCard } from "@/components/event-dashboard-card";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const events = await getUserEvents();

  return (
    <div className="container px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{ru.myEvents}</h1>
          <p className="text-muted-foreground">{ru.dashboard}</p>
        </div>
        <Link href="/events/new">
          <Button>
            <CalendarPlus className="h-4 w-4" />
            {ru.createEvent}
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">{ru.noEvents}</p>
            <Link href="/events/new">
              <Button>
                <CalendarPlus className="h-4 w-4" />
                {ru.createFirst}
              </Button>
            </Link>
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
              requireAuth={event.requireAuth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

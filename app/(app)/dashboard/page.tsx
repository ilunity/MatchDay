import Link from "next/link";
import { getUserEvents } from "@/actions/events";
import { formatDateShortRu } from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <Button>{ru.createEvent}</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">{ru.noEvents}</p>
            <Link href="/events/new">
              <Button>{ru.createFirst}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event._id.toString()} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {ru.createdAt}:{" "}
                  {formatDateShortRu(new Date(event.createdAt))}
                </p>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="mb-4 text-sm text-muted-foreground">
                  {event.possibleDates.length} возможных дат
                  {event.requireAuth && " · только для зарегистрированных"}
                </p>
                <Link href={`/e/${event.slug}`}>
                  <Button variant="outline" className="w-full">
                    {ru.openEvent}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

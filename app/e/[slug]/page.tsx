import Link from "next/link";
import { redirect } from "next/navigation";
import { getEventStats } from "@/actions/events";
import { getUserAvailability } from "@/actions/availability";
import { auth } from "@/lib/auth";
import { getGuestId, getGuestName } from "@/lib/guest";
import { ru } from "@/lib/i18n/ru";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { EventHeader } from "@/components/event-header";
import { DateStats } from "@/components/date-stats";
import { GuestNameForm } from "@/components/guest-name-form";
import { ShareLink } from "@/components/share-link";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getEventStats(slug);

  if (!data) {
    return (
      <div className="container px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{ru.eventNotFound}</h1>
        <Link href="/" className="mt-4 inline-block">
          <Button variant="outline">{ru.backHome}</Button>
        </Link>
      </div>
    );
  }

  const { event, stats, totalParticipants } = data;
  const session = await auth();
  const isOwner = session?.user?.id === event.ownerId.toString();

  if (event.requireAuth && !session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/e/${slug}`)}`);
  }

  const guestId = await getGuestId();
  const guestName = await getGuestName();
  const needsGuestName = !event.requireAuth && !session && !guestId;

  const possibleDates = event.possibleDates.map((d) => new Date(d));
  const userAvailability = await getUserAvailability(event._id.toString());
  const initialSelected = userAvailability.map((d) => new Date(d));
  const bestDates = stats.slice(0, 3).map((s) => s.date);

  const appUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const shareUrl = `${appUrl}/e/${slug}`;
  const coverUrl = event.coverImageKey
    ? `/api/storage/${event.coverImageKey}`
    : undefined;

  return (
    <div className="container max-w-4xl px-4 py-8">
      <GuestNameForm eventSlug={slug} open={needsGuestName} />

      <EventHeader
        title={event.title}
        description={event.description}
        coverUrl={coverUrl}
        actions={
          isOwner ? (
            <Link href={`/events/${slug}/edit`}>
              <Button variant="outline">{ru.edit}</Button>
            </Link>
          ) : undefined
        }
        meta={
          !session && guestName ? (
            <p className="text-sm text-muted-foreground">
              {ru.welcomeGuest} {guestName}
            </p>
          ) : undefined
        }
      />

      <div className="mt-8 space-y-2">
        <h2 className="text-sm font-medium">{ru.shareLink}</h2>
        <ShareLink url={shareUrl} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <AvailabilityCalendar
          eventId={event._id.toString()}
          eventSlug={slug}
          possibleDates={possibleDates}
          initialSelected={initialSelected}
          bestDates={bestDates}
          disabled={needsGuestName}
        />
        <DateStats stats={stats} totalParticipants={totalParticipants} />
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getEventStats } from "@/actions/events";
import { getUserAvailability } from "@/actions/availability";
import { auth } from "@/lib/auth";
import { getGuestId, getGuestName } from "@/lib/guest";
import { normalizeDates } from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { CompleteProfileForm } from "@/components/complete-profile-form";
import { EventHeader } from "@/components/event-header";
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

  const { event, stats, totalParticipants, participantsByDate } = data;
  const session = await auth();
  const isOwner = session?.user?.id === event.ownerId.toString();

  if (event.requireAuth && !session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/e/${slug}`)}`);
  }

  const guestId = await getGuestId();
  const guestName = await getGuestName();
  const needsGuestName = !event.requireAuth && !session && !guestId;
  const needsProfileName = !!session?.user?.id && !session.user.name?.trim();
  const calendarDisabled = needsGuestName || needsProfileName;

  const possibleDates = normalizeDates(
    event.possibleDates.map((d) => new Date(d))
  );
  const userAvailability = await getUserAvailability(event._id.toString());
  const initialSelected = normalizeDates(
    userAvailability.map((d) => new Date(d))
  );
  const bestDates = stats.slice(0, 3).map((s) => s.date);
  const currentUserName =
    session?.user?.name?.trim() || guestName?.trim() || undefined;

  const appUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const shareUrl = `${appUrl}/e/${slug}`;
  const coverUrl = event.coverImageKey
    ? `/api/storage/${event.coverImageKey}`
    : undefined;

  return (
    <>
      <div className="container max-w-4xl px-4 py-6 md:py-8">
        <GuestNameForm eventSlug={slug} open={needsGuestName} />
        <CompleteProfileForm open={needsProfileName} />

        <EventHeader
          title={event.title}
          description={event.description}
          coverUrl={coverUrl}
          actions={
            isOwner ? (
              <Link href={`/events/${slug}/edit`} className="block w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">{ru.edit}</Button>
              </Link>
            ) : undefined
          }
        />

        {isOwner && (
          <div className="mt-8 space-y-2">
            <h2 className="text-sm font-medium">{ru.shareLink}</h2>
            <ShareLink url={shareUrl} />
          </div>
        )}
      </div>

      <div className="container max-w-4xl px-4 pb-6 md:pb-8 mt-6 md:mt-10">
        <AvailabilityCalendar
          eventId={event._id.toString()}
          eventSlug={slug}
          possibleDates={possibleDates}
          initialSelected={initialSelected}
          bestDates={bestDates}
          participantsByDate={participantsByDate}
          currentUserName={currentUserName}
          disabled={calendarDisabled}
          stats={stats}
          totalParticipants={totalParticipants}
        />
      </div>
    </>
  );
}

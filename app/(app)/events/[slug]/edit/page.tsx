import { notFound } from "next/navigation";
import { getEventForOwner } from "@/actions/events";
import { EventForm } from "@/components/event-form";
import { ru } from "@/lib/i18n/ru";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditEventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventForOwner(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="container max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{ru.editEvent}</h1>
        <p className="text-muted-foreground">{ru.editEventHint}</p>
      </div>
      <EventForm
        mode="edit"
        initial={{
          slug: event.slug,
          title: event.title,
          description: event.description,
          coverUrl: event.coverImageKey
            ? `/api/storage/${event.coverImageKey}`
            : undefined,
          possibleDates: event.possibleDates.map((d) => new Date(d)),
          requireAuth: event.requireAuth,
        }}
      />
    </div>
  );
}

import { EventForm } from "@/components/event-form";
import { ru } from "@/lib/i18n/ru";

export default function NewEventPage() {
  return (
    <div className="container max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{ru.createEvent}</h1>
        <p className="text-muted-foreground">{ru.tagline}</p>
      </div>
      <EventForm />
    </div>
  );
}

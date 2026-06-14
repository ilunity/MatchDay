import { EventForm } from "@/components/event-form";
import { ru } from "@/lib/i18n/ru";

export default function NewEventPage() {
  return (
    <div className="container max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{ru.createEvent}</h1>
        <p className="text-muted-foreground">{ru.tagline}</p>
      </div>
      <EventForm />
    </div>
  );
}

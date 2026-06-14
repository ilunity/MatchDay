"use client";

import { useState, useTransition } from "react";
import { createEvent } from "@/actions/events";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { dateKey } from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";

export function EventForm() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [requireAuth, setRequireAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("requireAuth", requireAuth ? "on" : "off");
    selectedDates.forEach((d) => formData.append("possibleDates", dateKey(d)));

    startTransition(async () => {
      try {
        await createEvent(formData);
      } catch (err) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") {
          throw err;
        }
        setError(ru.errorGeneric);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">{ru.title}</Label>
        <Input id="title" name="title" required maxLength={200} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{ru.descriptionLabel}</Label>
        <Textarea
          id="description"
          name="description"
          placeholder={ru.descriptionPlaceholder}
          maxLength={2000}
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor="requireAuth">{ru.requireAuth}</Label>
          <p className="text-sm text-muted-foreground">{ru.requireAuthHint}</p>
        </div>
        <Switch
          id="requireAuth"
          checked={requireAuth}
          onCheckedChange={setRequireAuth}
        />
      </div>

      <div className="space-y-2">
        <Label>{ru.possibleDates}</Label>
        <p className="text-sm text-muted-foreground">{ru.possibleDatesHint}</p>
        <div className="overflow-x-auto rounded-lg border bg-card p-2">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={(dates) => setSelectedDates(dates ?? [])}
            numberOfMonths={1}
            className="mx-auto"
          />
        </div>
        {selectedDates.length === 0 && (
          <p className="text-sm text-destructive">Выберите хотя бы одну дату</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={pending || selectedDates.length === 0}
        className="w-full sm:w-auto"
      >
        {pending ? ru.loading : ru.create}
      </Button>
    </form>
  );
}

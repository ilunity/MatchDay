"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createEvent, updateEvent } from "@/actions/events";
import { EventCoverField } from "@/components/event-cover-field";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { dateKey, getDefaultMonth } from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { cn } from "@/lib/utils";

type EventFormInitial = {
  slug: string;
  title: string;
  description?: string;
  coverUrl?: string;
  possibleDates: Date[];
  requireAuth?: boolean;
};

type EventFormProps =
  | { mode?: "create" }
  | { mode: "edit"; initial: EventFormInitial };

export function EventForm(props: EventFormProps = { mode: "create" }) {
  const isEdit = props.mode === "edit";
  const initial = isEdit ? props.initial : undefined;
  const mode = isEdit ? "edit" : "create";

  const [selectedDates, setSelectedDates] = useState<Date[]>(
    initial?.possibleDates ?? []
  );
  const [requireAuth, setRequireAuth] = useState(initial?.requireAuth ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isLgUp = useMediaQuery("(min-width: 600px)");
  const calendarSize = isLgUp ? "lg" : "sm";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("requireAuth", requireAuth ? "on" : "off");
    selectedDates.forEach((d) => formData.append("possibleDates", dateKey(d)));

    if (mode === "edit" && initial) {
      formData.set("slug", initial.slug);
    }

    startTransition(async () => {
      try {
        const result =
          mode === "edit" ? await updateEvent(formData) : await createEvent(formData);

        if (result && !result.success) {
          setError(result.error ?? ru.errorGeneric);
        }
      } catch (err) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") {
          throw err;
        }
        setError(ru.errorGeneric);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="title">{ru.title}</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={initial?.title}
        />
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
        <div className="w-full shrink-0 md:max-w-md">
          <EventCoverField compact initialCoverUrl={initial?.coverUrl} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Label htmlFor="description">{ru.descriptionLabel}</Label>
          <Textarea
            id="description"
            name="description"
            placeholder={ru.descriptionPlaceholder}
            maxLength={2000}
            defaultValue={initial?.description ?? ""}
            rows={5}
            className="min-h-[7rem] flex-1 resize-y md:min-h-0"
          />
        </div>
      </div>

      {mode === "create" && (
        <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
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
      )}

      <div className="space-y-2">
        <Label>{ru.possibleDates}</Label>
        <p className="text-sm text-muted-foreground">
          {mode === "edit" ? ru.possibleDatesEditHint : ru.possibleDatesHint}
        </p>
        <div className="flex w-full flex-col items-center rounded-lg border bg-card p-2">
          <div className={cn("w-full", isLgUp && "max-w-xl")}>
            <Calendar
              size={calendarSize}
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => setSelectedDates(dates ?? [])}
              defaultMonth={getDefaultMonth(
                selectedDates.length > 0 ? selectedDates : undefined
              )}
              numberOfMonths={1}
              className="w-full"
            />
          </div>
        </div>
        {selectedDates.length === 0 && (
          <p className="text-sm text-destructive">{ru.selectAtLeastOneDate}</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          disabled={pending || selectedDates.length === 0}
          className="w-full sm:w-auto"
        >
          {pending ? ru.loading : mode === "edit" ? ru.save : ru.create}
        </Button>
        {mode === "edit" && initial && (
          <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
            <Link href={`/e/${initial.slug}`}>{ru.cancel}</Link>
          </Button>
        )}
      </div>
    </form>
  );
}

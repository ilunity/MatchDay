"use client";

import { useState, useTransition } from "react";
import { setAvailability } from "@/actions/availability";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { dateKey } from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { toast } from "sonner";

export function AvailabilityCalendar({
  eventId,
  eventSlug,
  possibleDates,
  initialSelected,
  bestDates,
  disabled,
}: {
  eventId: string;
  eventSlug: string;
  possibleDates: Date[];
  initialSelected: Date[];
  bestDates: string[];
  disabled?: boolean;
}) {
  const possibleSet = new Set(possibleDates.map(dateKey));
  const [selected, setSelected] = useState<Date[]>(initialSelected);
  const [pending, startTransition] = useTransition();

  function handleSelect(dates: Date[] | undefined) {
    if (!dates) {
      setSelected([]);
      return;
    }
    const filtered = dates.filter((d) => possibleSet.has(dateKey(d)));
    setSelected(filtered);
  }

  function handleSave() {
    const formData = new FormData();
    formData.set("eventId", eventId);
    formData.set("eventSlug", eventSlug);
    selected.forEach((d) => formData.append("availableDates", dateKey(d)));

    startTransition(async () => {
      const result = await setAvailability(formData);
      if (result.success) {
        toast.success(ru.availabilitySaved);
      } else {
        toast.error(result.error ?? ru.errorGeneric);
      }
    });
  }

  const isDayDisabled = (date: Date) => !possibleSet.has(dateKey(date));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{ru.yourAvailability}</h3>
        <p className="text-sm text-muted-foreground">{ru.availabilityHint}</p>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card p-2">
        <Calendar
          mode="multiple"
          selected={selected}
          onSelect={handleSelect}
          possibleDates={possibleDates}
          bestDates={bestDates}
          disabled={disabled ? true : isDayDisabled}
          numberOfMonths={1}
          className="mx-auto"
        />
      </div>
      {!disabled && (
        <Button onClick={handleSave} disabled={pending} className="w-full sm:w-auto">
          {pending ? ru.loading : ru.saveAvailability}
        </Button>
      )}
    </div>
  );
}

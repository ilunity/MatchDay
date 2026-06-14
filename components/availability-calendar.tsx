"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { setAvailability } from "@/actions/availability";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { dateKey } from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { toast } from "sonner";

function dateSetsEqual(a: Date[], b: Date[]): boolean {
  const keysA = new Set(a.map(dateKey));
  if (keysA.size !== b.length) {
    return false;
  }
  return b.every((date) => keysA.has(dateKey(date)));
}

export function AvailabilityCalendar({
  eventId,
  eventSlug,
  possibleDates,
  initialSelected,
  bestDates,
  participantsByDate,
  disabled,
  statsAside,
}: {
  eventId: string;
  eventSlug: string;
  possibleDates: Date[];
  initialSelected: Date[];
  bestDates: string[];
  participantsByDate?: Record<string, string[]>;
  disabled?: boolean;
  statsAside?: ReactNode;
}) {
  const possibleSet = new Set(possibleDates.map(dateKey));
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState<Date[]>(initialSelected);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  const hasChanges = useMemo(
    () => !dateSetsEqual(selected, initialSelected),
    [selected, initialSelected]
  );

  function handleSelect(dates: Date[] | undefined) {
    if (!isEditing) {
      return;
    }
    if (!dates) {
      setSelected([]);
      return;
    }
    const filtered = dates.filter((d) => possibleSet.has(dateKey(d)));
    setSelected(filtered);
  }

  function handleCancelEdit() {
    setSelected(initialSelected);
    setIsEditing(false);
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
        setIsEditing(false);
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
        <p className="text-sm text-muted-foreground">
          {isEditing ? ru.availabilityHint : ru.availabilityViewHint}
        </p>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border bg-card p-2">
            <Calendar
              mode="multiple"
              selected={selected}
              onSelect={isEditing ? handleSelect : undefined}
              possibleDates={possibleDates}
              bestDates={bestDates}
              participantsByDate={participantsByDate}
              showParticipantTooltip={!isEditing}
              readOnly={!isEditing}
              disabled={disabled ? true : isDayDisabled}
              numberOfMonths={1}
              className="mx-auto"
            />
          </div>
          {!disabled && (
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={pending || !hasChanges}
                    className="w-full sm:w-auto"
                  >
                    {pending ? ru.loading : ru.saveAvailability}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={pending}
                    className="w-full sm:w-auto"
                  >
                    {ru.cancelEdit}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto"
                >
                  {ru.markDates}
                </Button>
              )}
            </div>
          )}
        </div>
        {statsAside}
      </div>
    </div>
  );
}

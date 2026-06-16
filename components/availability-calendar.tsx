"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { setAvailability } from "@/actions/availability";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Calendar } from "@/components/ui/calendar";
import { DateStats } from "@/components/date-stats";
import { Button } from "@/components/ui/button";
import { dateKey, getDefaultMonth, normalizeDates, parseDateKey } from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { cn } from "@/lib/utils";
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
  currentUserName,
  disabled,
  stats,
  totalParticipants,
}: {
  eventId: string;
  eventSlug: string;
  possibleDates: Date[];
  initialSelected: Date[];
  bestDates: string[];
  participantsByDate?: Record<string, string[]>;
  currentUserName?: string;
  disabled?: boolean;
  stats?: Array<{ date: string; count: number; participants?: string[] }>;
  totalParticipants?: number;
}) {
  const possibleSet = new Set(possibleDates.map(dateKey));
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState<Date[]>(() =>
    normalizeDates(initialSelected)
  );
  const [pending, startTransition] = useTransition();
  const [month, setMonth] = useState(() => getDefaultMonth(possibleDates));
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
  const [highlightKey, setHighlightKey] = useState(0);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  function handleBestDateClick(date: string) {
    const parsed = parseDateKey(date);
    setMonth(new Date(parsed.getUTCFullYear(), parsed.getUTCMonth(), 1));
    setHighlightedDate(date);
    setHighlightKey((key) => key + 1);

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedDate(null);
      highlightTimeoutRef.current = null;
    }, 3000);

    if (!window.matchMedia("(min-width: 1024px)").matches) {
      calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  useEffect(() => {
    setSelected(normalizeDates(initialSelected));
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
    const filtered = normalizeDates(
      dates.filter((d) => possibleSet.has(dateKey(d)))
    );
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
  const isLgUp = useMediaQuery("(min-width: 600px)");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{ru.yourAvailability}</h3>
        <p className="text-sm text-muted-foreground">
          {isEditing ? ru.availabilityHint : ru.availabilityViewHint}
        </p>
      </div>
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div ref={calendarRef} className="w-full shrink-0 lg:w-auto">
          <div className="flex w-full flex-col items-center rounded-lg border bg-card p-2">
            <div className={cn("w-full", isLgUp && "max-w-xl")}>
              <Calendar
                size={isLgUp ? "lg" : "sm"}
                mode="multiple"
                selected={selected}
                onSelect={handleSelect}
                month={month}
                onMonthChange={setMonth}
                possibleDates={possibleDates}
                bestDates={bestDates}
                participantsByDate={participantsByDate}
                currentUserName={currentUserName}
                showParticipantTooltip={!isEditing}
                readOnly={!isEditing}
                disabled={disabled ? true : isDayDisabled}
                highlightedDate={highlightedDate}
                highlightKey={highlightKey}
                numberOfMonths={1}
                className="w-full"
              />
            </div>
            {!disabled && (
              <div className="mt-2 border-t pt-2">
                {isEditing ? (
                  <div className="grid w-full grid-cols-2 gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={pending || !hasChanges}
                      className="w-full"
                    >
                      {pending ? ru.loading : ru.saveAvailability}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={pending}
                      className="w-full"
                    >
                      {ru.cancelEdit}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto"
                  >
                    {initialSelected.length === 0
                      ? ru.startSelectingDates
                      : ru.changeSelection}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        {stats && totalParticipants !== undefined && (
          <div className="relative min-w-0 flex-1 lg:self-stretch">
            <div className="flex min-h-0 flex-col lg:absolute lg:inset-0 lg:overflow-hidden">
              <DateStats
                stats={stats}
                totalParticipants={totalParticipants}
                currentUserName={currentUserName}
                onDateClick={handleBestDateClick}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

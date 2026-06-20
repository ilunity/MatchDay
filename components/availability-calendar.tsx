"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CalendarCheck, CalendarDays, CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { setAvailability } from "@/actions/availability";
import { setEventConfirmation } from "@/actions/events";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Calendar } from "@/components/ui/calendar";
import { CalendarLegend } from "@/components/calendar-legend";
import { DateStats } from "@/components/date-stats";
import { useUnsavedChanges } from "@/components/unsaved-changes-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  dateKey,
  getDefaultMonth,
  normalizeDates,
  parseDateKey,
} from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import type { ConfirmationMode } from "@/lib/validations/confirmation";
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
  initialConfirmedDates,
  bestDates,
  participantsByDate,
  currentUserName,
  disabled,
  stats,
  totalParticipants,
  isOwner = false,
  confirmationMode = null,
}: {
  eventId: string;
  eventSlug: string;
  possibleDates: Date[];
  initialSelected: Date[];
  initialConfirmedDates: Date[];
  bestDates: string[];
  participantsByDate?: Record<string, string[]>;
  currentUserName?: string;
  disabled?: boolean;
  stats?: Array<{ date: string; count: number; participants?: string[] }>;
  totalParticipants?: number;
  isOwner?: boolean;
  confirmationMode?: ConfirmationMode | null;
}) {
  const router = useRouter();
  const possibleSet = new Set(possibleDates.map(dateKey));
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDates, setIsConfirmingDates] = useState(false);
  const [isStatsConfirming, setIsStatsConfirming] = useState(false);
  const [selected, setSelected] = useState<Date[]>(() =>
    normalizeDates(initialSelected)
  );
  const [committedSelected, setCommittedSelected] = useState<Date[]>(() =>
    normalizeDates(initialSelected)
  );
  const [confirmedDraft, setConfirmedDraft] = useState<Date[]>(() =>
    normalizeDates(initialConfirmedDates)
  );
  const [pending, startTransition] = useTransition();
  const [month, setMonth] = useState(() => getDefaultMonth(possibleDates));
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
  const [highlightKey, setHighlightKey] = useState(0);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const { setHasUnsavedChanges } = useUnsavedChanges();

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

  const initialSelectedSignature = useMemo(
    () => initialSelected.map(dateKey).sort().join("\0"),
    [initialSelected]
  );

  useEffect(() => {
    const next = normalizeDates(initialSelected);
    setCommittedSelected(next);
    setSelected((prev) => (dateSetsEqual(prev, next) ? prev : next));
  }, [initialSelectedSignature, initialSelected]);

  useEffect(() => {
    setConfirmedDraft(normalizeDates(initialConfirmedDates));
  }, [initialConfirmedDates]);

  const hasAvailabilityChanges = useMemo(
    () => !dateSetsEqual(selected, committedSelected),
    [selected, committedSelected]
  );

  const hasConfirmationChanges = useMemo(() => {
    const datesChanged = !dateSetsEqual(
      confirmedDraft,
      initialConfirmedDates
    );
    const clearedAll =
      initialConfirmedDates.length > 0 && confirmedDraft.length === 0;
    return datesChanged || clearedAll;
  }, [confirmedDraft, initialConfirmedDates]);

  const hasUnsavedEdits =
    (isEditing && hasAvailabilityChanges) ||
    (isConfirmingDates && hasConfirmationChanges);

  useEffect(() => {
    setHasUnsavedChanges(hasUnsavedEdits);
    return () => setHasUnsavedChanges(false);
  }, [hasUnsavedEdits, setHasUnsavedChanges]);

  function handleAvailabilitySelect(dates: Date[] | undefined) {
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

  /** Keep DayPicker controlled in view mode — undefined onSelect uses stale internal state. */
  function handleReadOnlySelect() {}

  function handleToggleConfirmedDate(date: Date) {
    if (!isConfirmingDates) {
      return;
    }
    const key = dateKey(date);
    if (!possibleSet.has(key)) {
      return;
    }
    setConfirmedDraft((prev) => {
      const keys = new Set(prev.map(dateKey));
      if (keys.has(key)) {
        return normalizeDates(prev.filter((d) => dateKey(d) !== key));
      }
      return normalizeDates([...prev, date]);
    });
  }

  function handleCancelAvailabilityEdit() {
    setSelected(committedSelected);
    setIsEditing(false);
  }

  function handleCancelConfirmEdit() {
    setConfirmedDraft(normalizeDates(initialConfirmedDates));
    setIsConfirmingDates(false);
  }

  function handleClearAllConfirmedDates() {
    setConfirmedDraft([]);
  }

  function handleSaveAvailability() {
    const formData = new FormData();
    formData.set("eventId", eventId);
    formData.set("eventSlug", eventSlug);
    selected.forEach((d) => formData.append("availableDates", dateKey(d)));

    startTransition(async () => {
      const result = await setAvailability(formData);
      if (result.success) {
        toast.success(ru.availabilitySaved);
        setCommittedSelected(normalizeDates(selected));
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error ?? ru.errorGeneric);
      }
    });
  }

  function handleSaveConfirmation() {
    const formData = new FormData();
    formData.set("slug", eventSlug);
    confirmedDraft.forEach((d) => formData.append("confirmedDates", dateKey(d)));

    startTransition(async () => {
      const result = await setEventConfirmation(formData);
      if (result.success) {
        toast.success(ru.confirmationSaved);
        setIsConfirmingDates(false);
        router.refresh();
      } else {
        toast.error(result.error ?? ru.errorGeneric);
      }
    });
  }

  async function handleStatsConfirmationChange(dates: Date[]) {
    const formData = new FormData();
    formData.set("slug", eventSlug);
    dates.forEach((d) => formData.append("confirmedDates", dateKey(d)));

    const result = await setEventConfirmation(formData);
    if (result.success) {
      toast.success(ru.confirmationSaved);
      router.refresh();
    } else {
      toast.error(result.error ?? ru.errorGeneric);
    }
  }

  const isDayDisabled = (date: Date) => !possibleSet.has(dateKey(date));
  const isLgUp = useMediaQuery("(min-width: 600px)");

  const calendarConfirmedDates = isConfirmingDates
    ? confirmedDraft
    : normalizeDates(initialConfirmedDates);
  const showLegend =
    initialConfirmedDates.length > 0 ||
    isConfirmingDates ||
    confirmedDraft.length > 0;

  const calendarTitle = isConfirmingDates
    ? ru.confirmDates
    : ru.yourAvailability;
  const calendarHint = isConfirmingDates
    ? ru.confirmDatesHint
    : isEditing
      ? ru.availabilityHint
      : ru.availabilityViewHint;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{calendarTitle}</h3>
        <p className="text-sm text-muted-foreground">{calendarHint}</p>
      </div>
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div ref={calendarRef} className="w-full shrink-0 lg:w-auto">
          <div className="flex w-full flex-col items-center rounded-lg border bg-card p-2">
            <div className={cn("w-full", isLgUp && "max-w-xl")}>
              <Calendar
                size={isLgUp ? "lg" : "sm"}
                mode="multiple"
                selected={selected}
                onSelect={
                  isEditing ? handleAvailabilitySelect : handleReadOnlySelect
                }
                month={month}
                onMonthChange={setMonth}
                possibleDates={possibleDates}
                bestDates={bestDates}
                confirmedDates={calendarConfirmedDates}
                confirmationEditMode={isConfirmingDates}
                confirmationMode={confirmationMode}
                onToggleConfirmedDate={handleToggleConfirmedDate}
                participantsByDate={participantsByDate}
                currentUserName={currentUserName}
                showParticipantTooltip={!isEditing && !isConfirmingDates}
                readOnly={!isEditing && !isConfirmingDates}
                disabled={disabled && !isConfirmingDates ? true : isDayDisabled}
                highlightedDate={highlightedDate}
                highlightKey={highlightKey}
                numberOfMonths={1}
                className="w-full"
              />
              {showLegend && (
                <CalendarLegend className="mt-2 border-t pt-2" />
              )}
              <div className="mt-2 w-full border-t pt-2">
                {isConfirmingDates && isOwner ? (
                  <div className="flex flex-col gap-2">
                    {confirmedDraft.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearAllConfirmedDates}
                        disabled={pending}
                        className="w-full min-w-0"
                      >
                        {ru.resetAllConfirmedDates}
                      </Button>
                    )}
                    <div className="grid w-full grid-cols-2 gap-2">
                      <Button
                        onClick={handleSaveConfirmation}
                        disabled={pending || !hasConfirmationChanges}
                        className="w-full min-w-0"
                      >
                        {pending ? ru.loading : ru.saveConfirmation}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelConfirmEdit}
                        disabled={pending}
                        className="w-full min-w-0"
                      >
                        {ru.cancelEdit}
                      </Button>
                    </div>
                  </div>
                ) : isEditing ? (
                  <div className="grid w-full grid-cols-2 gap-2">
                    <Button
                      onClick={handleSaveAvailability}
                      disabled={pending || !hasAvailabilityChanges}
                      className="w-full min-w-0"
                    >
                      {pending ? ru.loading : ru.saveAvailability}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelAvailabilityEdit}
                      disabled={pending}
                      className="w-full min-w-0"
                    >
                      {ru.cancelEdit}
                    </Button>
                  </div>
                ) : !disabled ? (
                  <div
                    className={cn(
                      "grid w-full gap-2",
                      isOwner ? "grid-cols-2" : "grid-cols-1"
                    )}
                  >
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full min-w-0"
                    >
                      {committedSelected.length === 0 ? (
                        <>
                          <CalendarPlus className="size-4" aria-hidden />
                          {ru.startSelectingDates}
                        </>
                      ) : (
                        <>
                          <CalendarDays className="size-4" aria-hidden />
                          {ru.changeSelection}
                        </>
                      )}
                    </Button>
                    {isOwner && (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsConfirmingDates(true)}
                            disabled={isStatsConfirming}
                            className="w-full min-w-0"
                          >
                            <CalendarCheck className="size-4" aria-hidden />
                            {ru.confirmDates}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          {ru.confirmDatesTooltip}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
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
                isOwner={isOwner}
                isConfirmingDates={isConfirmingDates}
                confirmedDates={initialConfirmedDates.map(dateKey)}
                confirmationMode={confirmationMode}
                onConfirmationChange={handleStatsConfirmationChange}
                onEditingConfirmationChange={setIsStatsConfirming}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

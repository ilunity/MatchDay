"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useTransition,
} from "react";
import { Undo2, Redo2 } from "lucide-react";
import { createEvent, updateEvent } from "@/actions/events";
import { EventCoverField } from "@/components/event-cover-field";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DATE_PRESET_IDS,
  computePresetDates,
  mergeDates,
  type DatePresetId,
} from "@/lib/date-presets";
import {
  dateKey,
  formatDateDotRu,
  formatMonthYearRu,
  formatWeekRangeRu,
  getDefaultMonth,
  getToday,
  normalizeDates,
} from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { cn } from "@/lib/utils";

function dateSetsEqual(a: Date[], b: Date[]): boolean {
  const keysA = new Set(a.map(dateKey));
  if (keysA.size !== b.length) {
    return false;
  }
  return b.every((date) => keysA.has(dateKey(date)));
}

type DateHistoryState = {
  past: Date[][];
  present: Date[];
  future: Date[][];
};

type DateHistoryAction =
  | { type: "SET"; dates: Date[] }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; dates: Date[] };

function dateHistoryReducer(
  state: DateHistoryState,
  action: DateHistoryAction
): DateHistoryState {
  switch (action.type) {
    case "SET": {
      const dates = normalizeDates(action.dates);
      if (dateSetsEqual(state.present, dates)) {
        return state;
      }
      return {
        past: [...state.past, state.present],
        present: dates,
        future: [],
      };
    }
    case "UNDO": {
      if (state.past.length === 0) {
        return state;
      }
      const previous = state.past[state.past.length - 1]!;
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "REDO": {
      if (state.future.length === 0) {
        return state;
      }
      const next = state.future[0]!;
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
    case "RESET":
      return {
        past: [],
        present: normalizeDates(action.dates),
        future: [],
      };
  }
}

type EventFormInitial = {
  slug: string;
  title: string;
  description?: string;
  coverUrl?: string;
  possibleDates: Date[];
  requireAuth?: boolean;
  participantsByDate?: Record<string, string[]>;
  bestDates?: string[];
};

type EventFormProps =
  | { mode?: "create" }
  | { mode: "edit"; initial: EventFormInitial; currentUserName?: string };

function getPresetLabel(
  presetId: DatePresetId,
  visibleMonth: Date,
  today: Date
): string {
  const monthYear = formatMonthYearRu(visibleMonth);
  const fromDate = formatDateDotRu(today);

  switch (presetId) {
    case "allWeekendsOfMonth":
      return ru.datePresets.allWeekendsOfMonth(monthYear);
    case "allWeekdaysOfMonth":
      return ru.datePresets.allWeekdaysOfMonth(monthYear);
    case "allDaysOfMonth":
      return ru.datePresets.allDaysOfMonth(monthYear);
    case "next2Weeks":
      return ru.datePresets.next2Weeks(fromDate);
    case "next4Weeks":
      return ru.datePresets.next4Weeks(fromDate);
    case "next3Weekends":
      return ru.datePresets.next3Weekends(fromDate);
    case "thisWeek":
      return ru.datePresets.thisWeek(fromDate);
    case "nextWeek": {
      const weekDates = computePresetDates("nextWeek", {
        visibleMonth,
        today,
      });
      if (weekDates.length === 0) {
        return ru.datePresets.nextWeek(fromDate);
      }
      const range = formatWeekRangeRu(
        weekDates[0]!,
        weekDates[weekDates.length - 1]!
      );
      return ru.datePresets.nextWeek(range);
    }
  }
}

export function EventForm(props: EventFormProps = { mode: "create" }) {
  const isEdit = props.mode === "edit";
  const initial = isEdit ? props.initial : undefined;
  const currentUserName = isEdit ? props.currentUserName : undefined;
  const mode = isEdit ? "edit" : "create";

  const savedDates = useMemo(
    () => normalizeDates(initial?.possibleDates ?? []),
    [initial?.possibleDates]
  );
  const [dateHistory, dispatchDateHistory] = useReducer(dateHistoryReducer, {
    past: [],
    present: savedDates,
    future: [],
  });
  const selectedDates = dateHistory.present;
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [requireAuth, setRequireAuth] = useState(initial?.requireAuth ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isLgUp = useMediaQuery("(min-width: 600px)");
  const calendarSize = isLgUp ? "lg" : "sm";
  const [calendarMonth, setCalendarMonth] = useState(() =>
    getDefaultMonth(savedDates.length > 0 ? savedDates : undefined)
  );

  const today = useMemo(() => getToday(), []);
  const datesEditable = mode === "create" || isEditingDates;
  const canUndo = dateHistory.past.length > 0;
  const canRedo = dateHistory.future.length > 0;

  const hasDateChanges = useMemo(
    () => !dateSetsEqual(selectedDates, savedDates),
    [selectedDates, savedDates]
  );

  const presetLabels = useMemo(
    () =>
      DATE_PRESET_IDS.map((presetId) => ({
        id: presetId,
        label: getPresetLabel(presetId, calendarMonth, today),
      })),
    [calendarMonth, today]
  );

  const setSelectedDates = useCallback((dates: Date[]) => {
    dispatchDateHistory({ type: "SET", dates });
  }, []);

  const resetDateHistory = useCallback((dates: Date[]) => {
    dispatchDateHistory({ type: "RESET", dates });
  }, []);

  function handleSelectDates(dates: Date[] | undefined) {
    if (!datesEditable) {
      return;
    }
    setSelectedDates(dates ?? []);
  }

  function handleApplyPreset(presetId: DatePresetId) {
    if (!datesEditable) {
      return;
    }
    const presetDates = computePresetDates(presetId, {
      visibleMonth: calendarMonth,
      today,
    });
    setSelectedDates(mergeDates(selectedDates, presetDates));
  }

  function handleUndo() {
    if (!datesEditable) {
      return;
    }
    dispatchDateHistory({ type: "UNDO" });
  }

  function handleRedo() {
    if (!datesEditable) {
      return;
    }
    dispatchDateHistory({ type: "REDO" });
  }

  function handleSaveDatesEdit() {
    setIsEditingDates(false);
  }

  function handleCancelDatesEdit() {
    resetDateHistory(savedDates);
    setIsEditingDates(false);
  }

  function handleResetDatesEdit() {
    resetDateHistory(savedDates);
  }

  function handleResetDatesCreate() {
    resetDateHistory([]);
  }

  function handleStartEditingDates() {
    resetDateHistory(savedDates);
    setIsEditingDates(true);
  }

  useEffect(() => {
    if (!datesEditable) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) {
        return;
      }

      if (event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        dispatchDateHistory({ type: "UNDO" });
        return;
      }

      if (event.key === "y" || (event.key === "z" && event.shiftKey)) {
        event.preventDefault();
        dispatchDateHistory({ type: "REDO" });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [datesEditable]);

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
          {mode === "edit"
            ? isEditingDates
              ? ru.possibleDatesEditHint
              : ru.possibleDatesHint
            : ru.possibleDatesHint}
        </p>
        <div className="flex w-full flex-col items-center rounded-lg border bg-card p-2">
          <div className={cn("w-full", isLgUp && "max-w-xl")}>
            <Calendar
              size={calendarSize}
              mode="multiple"
              selected={selectedDates}
              onSelect={handleSelectDates}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              readOnly={!datesEditable}
              participantsByDate={initial?.participantsByDate}
              bestDates={initial?.bestDates}
              currentUserName={currentUserName}
              showParticipantTooltip={mode === "edit" && !isEditingDates}
              numberOfMonths={1}
              className="w-full"
            />
          </div>
          {datesEditable && (
            <div className="mt-2 w-full space-y-2 border-t pt-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {ru.datePresets.sectionLabel}
                </span>
                <TooltipProvider delayDuration={300}>
                  <div className="flex shrink-0 gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={handleUndo}
                          disabled={!canUndo}
                          aria-label={ru.datePresets.undo}
                        >
                          <Undo2 className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{ru.datePresets.undo}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={handleRedo}
                          disabled={!canRedo}
                          aria-label={ru.datePresets.redo}
                        >
                          <Redo2 className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{ru.datePresets.redo}</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
              <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
                {presetLabels.map(({ id, label }) => (
                  <Button
                    key={id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => handleApplyPreset(id)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {(mode === "create" && selectedDates.length > 0) ||
          mode === "edit" ? (
            <div className="mt-2 flex w-full flex-wrap gap-2 border-t pt-2">
              {mode === "create" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetDatesCreate}
                  className="w-full sm:w-auto"
                >
                  {ru.resetAllDates}
                </Button>
              ) : isEditingDates ? (
                <>
                  <Button
                    type="button"
                    onClick={handleSaveDatesEdit}
                    disabled={!hasDateChanges}
                    className="w-full sm:w-auto"
                  >
                    {ru.save}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelDatesEdit}
                    className="w-full sm:w-auto"
                  >
                    {ru.cancelEdit}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetDatesEdit}
                    className="w-full sm:w-auto"
                  >
                    {ru.resetAllDates}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={handleStartEditingDates}
                  className="w-full sm:w-auto"
                >
                  {selectedDates.length === 0
                    ? ru.startSelectingDates
                    : ru.changeSelection}
                </Button>
              )}
            </div>
          ) : null}
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

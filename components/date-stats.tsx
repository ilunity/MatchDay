"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CalendarCheck, CalendarDays, Check } from "lucide-react";
import { formatDateShortRu, parseDateKey } from "@/lib/dates";
import { getConfirmedDateTooltip } from "@/lib/confirmed-dates";
import { ru } from "@/lib/i18n/ru";
import type { ConfirmationMode } from "@/lib/validations/confirmation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Stat = { date: string; count: number; participants?: string[] };

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  return [...a].every((value) => b.has(value));
}

export function DateStats({
  stats,
  totalParticipants,
  currentUserName,
  onDateClick,
  isOwner = false,
  isConfirmingDates = false,
  confirmedDates = [],
  confirmationMode = null,
  onConfirmationChange,
  onEditingConfirmationChange,
}: {
  stats: Stat[];
  totalParticipants: number;
  currentUserName?: string;
  onDateClick?: (date: string) => void;
  isOwner?: boolean;
  isConfirmingDates?: boolean;
  confirmedDates?: string[];
  confirmationMode?: ConfirmationMode | null;
  onConfirmationChange?: (dates: Date[]) => Promise<void>;
  onEditingConfirmationChange?: (editing: boolean) => void;
}) {
  const [confirmedOnly, setConfirmedOnly] = useState(false);
  const [isEditingConfirmation, setIsEditingConfirmation] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(
    () => new Set(confirmedDates)
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedDates(new Set(confirmedDates));
  }, [confirmedDates]);

  useEffect(() => {
    onEditingConfirmationChange?.(isEditingConfirmation);
    return () => onEditingConfirmationChange?.(false);
  }, [isEditingConfirmation, onEditingConfirmationChange]);

  useEffect(() => {
    if (isConfirmingDates && isEditingConfirmation) {
      setIsEditingConfirmation(false);
      setSelectedDates(new Set(confirmedDates));
    }
  }, [isConfirmingDates, isEditingConfirmation, confirmedDates]);

  const confirmedSet = useMemo(
    () => new Set(confirmedDates),
    [confirmedDates]
  );
  const hasConfirmedDates = confirmedDates.length > 0;

  useEffect(() => {
    if (!hasConfirmedDates) {
      setConfirmedOnly(false);
    }
  }, [hasConfirmedDates]);

  const displayedStats = useMemo(() => {
    if (confirmedOnly) {
      const statsByDate = new Map(stats.map((stat) => [stat.date, stat]));
      return [...confirmedDates]
        .sort((a, b) => a.localeCompare(b))
        .map(
          (date) =>
            statsByDate.get(date) ?? {
              date,
              count: 0,
              participants: [],
            }
        );
    }
    return stats;
  }, [stats, confirmedOnly, confirmedDates]);

  const maxCount = displayedStats[0]?.count ?? stats[0]?.count ?? 0;

  const hasBulkChanges = useMemo(
    () => !setsEqual(selectedDates, confirmedSet),
    [selectedDates, confirmedSet]
  );

  const canManageConfirmation =
    isOwner && !!onConfirmationChange && !isConfirmingDates;

  function toggleSelected(date: string) {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  }

  function handleStartEditingConfirmation() {
    setSelectedDates(new Set(confirmedDates));
    setIsEditingConfirmation(true);
  }

  function handleCancelEditingConfirmation() {
    setSelectedDates(new Set(confirmedDates));
    setIsEditingConfirmation(false);
  }

  function handleBulkConfirm() {
    if (!onConfirmationChange || !hasBulkChanges) {
      return;
    }

    const nextDates = [...selectedDates].sort().map(parseDateKey);

    startTransition(async () => {
      await onConfirmationChange(nextDates);
      setIsEditingConfirmation(false);
    });
  }

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="shrink-0 space-y-3">
        <div>
          <CardTitle className="text-lg">{ru.bestDates}</CardTitle>
          <div className="space-y-0.5 text-sm text-muted-foreground">
            <p>{ru.bestDatesHint}</p>
            {isEditingConfirmation && (
              <p>{ru.statsBulkConfirmHint}</p>
            )}
            <p>
              {ru.totalParticipants}: {totalParticipants}
            </p>
          </div>
        </div>
        {(hasConfirmedDates ||
          (canManageConfirmation && !isEditingConfirmation)) && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            {hasConfirmedDates && (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmedOnly}
                  disabled={isEditingConfirmation}
                  onChange={(e) => setConfirmedOnly(e.target.checked)}
                  className="size-4 rounded border border-input accent-primary"
                />
                <span>{ru.statsConfirmedOnly}</span>
              </label>
            )}
            {canManageConfirmation && !isEditingConfirmation && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleStartEditingConfirmation}
              >
                <CalendarCheck className="size-4" aria-hidden />
                {ru.confirmDates}
              </Button>
            )}
          </div>
        )}
        {isEditingConfirmation && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={handleBulkConfirm}
              disabled={pending || !hasBulkChanges}
              className="w-full min-w-0"
            >
              {pending ? ru.loading : ru.saveConfirmation}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEditingConfirmation}
              disabled={pending}
              className="w-full min-w-0"
            >
              {ru.cancelEdit}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto">
          {displayedStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {confirmedOnly ? ru.noConfirmedDates : ru.noAvailability}
            </p>
          ) : (
            <ul className="space-y-3">
              {displayedStats.map((stat) => {
                const pct = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
                const isConfirmed = confirmedSet.has(stat.date);
                const isSelected = selectedDates.has(stat.date);
                return (
                  <li
                    key={stat.date}
                    className={cn(
                      "space-y-1 rounded-md border p-2",
                      isConfirmed
                        ? "border-amber-500"
                        : "border-border",
                      isEditingConfirmation &&
                        isSelected &&
                        !isConfirmed &&
                        "bg-accent/30"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {isEditingConfirmation ? (
                          <span className="flex size-4 shrink-0 items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={pending}
                              onChange={() => toggleSelected(stat.date)}
                              aria-label={formatDateShortRu(
                                parseDateKey(stat.date)
                              )}
                              className="size-4 rounded border border-input accent-primary"
                            />
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "truncate font-medium leading-none",
                            isConfirmed &&
                              "text-amber-700 dark:text-amber-400"
                          )}
                        >
                          {formatDateShortRu(parseDateKey(stat.date))}
                        </span>
                        {isConfirmed && (
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <span className="inline-flex shrink-0">
                                <Check
                                  className="size-3.5 text-amber-600 dark:text-amber-400"
                                  aria-hidden
                                />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="font-medium text-amber-700 dark:text-amber-400">
                                {getConfirmedDateTooltip(confirmationMode)}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {onDateClick && (
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="size-8 shrink-0"
                                onClick={() => onDateClick(stat.date)}
                                aria-label={ru.showDateInCalendar}
                              >
                                <CalendarDays className="size-4 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {ru.showDateInCalendar}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <span className="shrink-0 leading-none text-muted-foreground">
                        {stat.count}{" "}
                        {stat.count === 1
                          ? ru.participant
                          : stat.count < 5
                            ? "участника"
                            : ru.participants}
                      </span>
                    </div>
                    {stat.participants && stat.participants.length > 0 && (
                      <p className="break-words text-xs text-muted-foreground">
                        {stat.participants.map((name, i) => {
                          const isCurrentUser = currentUserName === name;
                          return (
                            <span key={name}>
                              {i > 0 && ", "}
                              <span
                                className={cn(
                                  isCurrentUser &&
                                    "font-medium text-green-600 dark:text-green-400"
                                )}
                              >
                                {name}
                                {isCurrentUser && ` ${ru.calendarParticipantYou}`}
                              </span>
                            </span>
                          );
                        })}
                      </p>
                    )}
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isConfirmed ? "bg-amber-500" : "bg-green-500"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

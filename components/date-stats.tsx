"use client";

import { CalendarDays } from "lucide-react";
import { formatDateShortRu, parseDateKey } from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Stat = { date: string; count: number; participants?: string[] };

export function DateStats({
  stats,
  totalParticipants,
  currentUserName,
  onDateClick,
}: {
  stats: Stat[];
  totalParticipants: number;
  currentUserName?: string;
  onDateClick?: (date: string) => void;
}) {
  const maxCount = stats[0]?.count ?? 0;

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="text-lg">{ru.bestDates}</CardTitle>
        <div className="space-y-0.5 text-sm text-muted-foreground">
          <p>{ru.bestDatesHint}</p>
          <p>
            {ru.totalParticipants}: {totalParticipants}
          </p>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        {stats.length === 0 ? (
          <p className="text-sm text-muted-foreground">{ru.noAvailability}</p>
        ) : (
          <ul className="space-y-3">
            {stats.map((stat) => {
              const pct = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
              return (
                <li key={stat.date} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">
                      {formatDateShortRu(parseDateKey(stat.date))}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-muted-foreground">
                        {stat.count}{" "}
                        {stat.count === 1
                          ? ru.participant
                          : stat.count < 5
                            ? "участника"
                            : ru.participants}
                      </span>
                      {onDateClick && (
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="default"
                              size="icon"
                              className="size-7"
                              onClick={() => onDateClick(stat.date)}
                              aria-label={ru.showDateInCalendar}
                            >
                              <CalendarDays className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {ru.showDateInCalendar}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
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
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

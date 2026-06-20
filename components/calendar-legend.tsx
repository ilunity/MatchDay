"use client";

import { Check } from "lucide-react";
import { ru } from "@/lib/i18n/ru";
import { cn } from "@/lib/utils";

export function CalendarLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="inline-flex size-5 items-center justify-center rounded-md bg-blue-300 text-blue-900 dark:bg-blue-800 dark:text-slate-50"
          aria-hidden
        />
        <span>{ru.calendarLegendSelected}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="relative inline-flex size-5 items-center justify-center rounded-md ring-2 ring-amber-500"
          aria-hidden
        >
          <Check className="absolute -top-0.5 -right-0.5 size-3.5 text-amber-600 dark:text-amber-400" />
        </span>
        <span>{ru.calendarLegendConfirmed}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-flex size-5 items-center justify-center rounded-md text-sm font-medium text-green-600 dark:text-green-400"
          aria-hidden
        >
          3
        </span>
        <span>{ru.calendarLegendParticipants}</span>
      </div>
    </div>
  );
}

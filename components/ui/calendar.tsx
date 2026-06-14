"use client";

import * as React from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps,
} from "react-day-picker";
import { ru as ruLocale } from "react-day-picker/locale";
import { dateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_SIZE = "h-[42px] w-[42px]";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  possibleDates?: Date[];
  bestDates?: string[];
  dateParticipants?: Record<string, string[]>;
};

function createDayButton(dateParticipants: Record<string, string[]>) {
  return function AvailabilityDayButton({
    day,
    modifiers,
    className,
    ...props
  }: DayButtonProps) {
    const key = dateKey(day.date);
    const names = dateParticipants[key] ?? [];
    const isSelected = modifiers.selected;
    const isPossible = modifiers.possible;
    const isDisabled = modifiers.disabled;
    const isToday = modifiers.today;

    const backgroundClass = isSelected
      ? "bg-blue-600 text-white hover:bg-blue-600 hover:text-white"
      : isPossible
        ? "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100"
        : isToday
          ? "bg-accent text-accent-foreground"
          : "";

    const tooltip =
      names.length > 0 ? names.join(", ") : undefined;

    return (
      <button
        type="button"
        className={cn(
          DAY_SIZE,
          "relative inline-flex flex-col items-center justify-center gap-0.5 rounded-md p-0 text-xs font-normal",
          "hover:opacity-90 focus-visible:outline-none",
          backgroundClass,
          isDisabled && "cursor-not-allowed opacity-50",
          className
        )}
        title={tooltip}
        aria-label={
          tooltip
            ? `${day.date.getDate()}, ${tooltip}`
            : String(day.date.getDate())
        }
        {...props}
      >
        <span className="text-sm leading-none">{day.date.getDate()}</span>
        {names.length > 0 && (
          <span className="text-[0.65rem] font-medium leading-none text-green-600 dark:text-green-400">
            {names.length}
          </span>
        )}
      </button>
    );
  };
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  possibleDates,
  bestDates = [],
  dateParticipants = {},
  modifiers,
  modifiersClassNames,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  const bestSet = new Set(bestDates);
  const DayButton = React.useMemo(
    () => createDayButton(dateParticipants),
    [dateParticipants]
  );

  return (
    <DayPicker
      locale={ruLocale}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex flex-col sm:flex-row gap-4", defaultClassNames.months),
        month: cn("flex flex-col gap-4", defaultClassNames.month),
        month_caption: cn(
          "flex justify-center pt-1 relative items-center w-full",
          defaultClassNames.month_caption
        ),
        caption_label: cn("text-sm font-medium", defaultClassNames.caption_label),
        nav: cn("flex items-center gap-1", defaultClassNames.nav),
        button_previous: cn(
          "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md",
          defaultClassNames.button_next
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex w-full", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex items-center justify-center font-normal text-[0.8rem]",
          DAY_SIZE,
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          DAY_SIZE,
          defaultClassNames.day
        ),
        day_button: cn(defaultClassNames.day_button),
        selected: cn(defaultClassNames.selected),
        today: cn(defaultClassNames.today),
        outside: cn("text-muted-foreground opacity-50", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
        DayButton,
        ...components,
      }}
      modifiers={{
        possible: possibleDates ?? [],
        best: (date) => bestSet.has(dateKey(date)),
        ...modifiers,
      }}
      modifiersClassNames={{
        possible: "",
        best: "",
        selected: "",
        ...modifiersClassNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };

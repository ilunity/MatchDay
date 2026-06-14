"use client";

import * as React from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps,
} from "react-day-picker";
import { ru as ruLocale } from "react-day-picker/locale";
import { dateKey } from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CALENDAR_SIZES = {
  sm: {
    dayCell: "h-[42px] w-[42px] p-0",
    gridWidth: "w-[294px]",
    dayNumber: "text-sm",
    participantCount: "text-[0.65rem]",
    weekday: "text-[0.8rem]",
  },
  lg: {
    dayCell: "h-[71px] w-[71px] p-0",
    gridWidth: "w-[497px]",
    dayNumber: "text-base",
    participantCount: "text-xs",
    weekday: "text-sm",
  },
} as const;

export type CalendarSize = keyof typeof CALENDAR_SIZES;

type DayButtonOptions = {
  size: CalendarSize;
  participantsByDate: Record<string, string[]>;
  showParticipantTooltip: boolean;
  readOnly: boolean;
  currentUserName?: string;
};

function createDayButton({
  size,
  participantsByDate,
  showParticipantTooltip,
  readOnly,
  currentUserName,
}: DayButtonOptions) {
  const { dayCell, dayNumber, participantCount } = CALENDAR_SIZES[size];

  return function AvailabilityDayButton({
    day,
    modifiers,
    className,
    onClick,
    ...props
  }: DayButtonProps) {
    const key = dateKey(day.date);
    const names = participantsByDate[key] ?? [];
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

    const button = (
      <button
        type="button"
        className={cn(
          dayCell,
          "relative inline-flex flex-col items-center justify-center gap-0 rounded-md text-xs font-normal",
          readOnly
            ? "cursor-default hover:opacity-100"
            : "hover:opacity-90 focus-visible:outline-none",
          backgroundClass,
          isDisabled && "cursor-not-allowed opacity-50",
          className
        )}
        aria-label={
          names.length > 0
            ? `${day.date.getDate()}, ${names.join(", ")}`
            : String(day.date.getDate())
        }
        onClick={
          readOnly
            ? (event) => {
                event.preventDefault();
                event.stopPropagation();
              }
            : onClick
        }
        tabIndex={readOnly ? -1 : props.tabIndex}
        {...props}
      >
        <span className={cn("leading-none", dayNumber)}>{day.date.getDate()}</span>
        {names.length > 0 && (
          <span
            className={cn(
              "font-medium leading-none text-green-600 dark:text-green-400",
              participantCount
            )}
          >
            {names.length}
          </span>
        )}
      </button>
    );

    if (showParticipantTooltip && names.length > 0) {
      return (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="mb-1 font-medium">{ru.calendarParticipants}</p>
            <ul className="space-y-0.5">
              {names.map((name) => (
                <li
                  key={name}
                  className={cn(
                    currentUserName === name &&
                      "font-medium text-green-600 dark:text-green-400"
                  )}
                >
                  {name}
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };
}

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  size?: CalendarSize;
  possibleDates?: Date[];
  bestDates?: string[];
  participantsByDate?: Record<string, string[]>;
  showParticipantTooltip?: boolean;
  readOnly?: boolean;
  currentUserName?: string;
};

function Calendar({
  className,
  classNames,
  size = "lg",
  showOutsideDays = true,
  possibleDates,
  bestDates = [],
  participantsByDate = {},
  showParticipantTooltip = false,
  readOnly = false,
  currentUserName,
  modifiers,
  modifiersClassNames,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  const { dayCell, gridWidth, weekday } = CALENDAR_SIZES[size];
  const bestSet = new Set(bestDates);
  const DayButton = React.useMemo(
    () =>
      createDayButton({
        size,
        participantsByDate,
        showParticipantTooltip,
        readOnly,
        currentUserName,
      }),
    [size, participantsByDate, showParticipantTooltip, readOnly, currentUserName]
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
        month_grid: cn(
          gridWidth,
          "table-fixed border-collapse",
          defaultClassNames.month_grid
        ),
        weekdays: cn(defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground font-normal text-center align-middle",
          dayCell,
          weekday,
          defaultClassNames.weekday
        ),
        weeks: cn(defaultClassNames.weeks),
        week: cn(defaultClassNames.week),
        day: cn(
          "relative p-0 text-center text-sm align-middle",
          dayCell,
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

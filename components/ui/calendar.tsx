"use client";

import * as React from "react";
import {
  DayPicker,
  getDefaultClassNames,
  useDayPicker,
  type DayButtonProps,
  type DropdownProps,
} from "react-day-picker";
import { ru as ruLocale } from "react-day-picker/locale";
import {
  dateKey,
  getCalendarMonthBounds,
  getDefaultMonth,
  getMonthsWithPossibleDates,
  getYearsWithPossibleDates,
  monthKey,
} from "@/lib/dates";
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
    dayCell: "size-full p-0",
    dayColumn: "h-auto p-0 md:h-[42px]",
    weekdayCell: "h-8 p-0",
    dayBox: "w-full aspect-square md:aspect-auto md:size-[42px]",
    gridWidth: "w-full md:w-[294px]",
    cssVars:
      "[--rdp-day-height:auto] md:[--rdp-day-height:42px] [--rdp-weekday-padding:0] [--rdp-weekday-text-align:center]",
    dayNumber: "text-sm",
    participantCount: "text-[0.65rem]",
    weekday: "text-[0.8rem]",
  },
  lg: {
    dayCell: "size-full p-0",
    dayColumn: "h-[71px] p-0",
    weekdayCell: "h-8 p-0",
    dayBox: "size-[42px]",
    gridWidth: "w-[497px]",
    cssVars:
      "[--rdp-day-height:71px] [--rdp-weekday-padding:0] [--rdp-weekday-text-align:center]",
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
  selectedDateKeys: Set<string>;
};

function createDayButton({
  size,
  participantsByDate,
  showParticipantTooltip,
  readOnly,
  currentUserName,
  selectedDateKeys,
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
    const isSelected =
      selectedDateKeys.has(key) || Boolean(modifiers.selected);
    const isDisabled = modifiers.disabled;

    const cursorClass = isDisabled
      ? "cursor-not-allowed"
      : readOnly
        ? showParticipantTooltip && names.length > 0
          ? "cursor-pointer"
          : "cursor-default"
        : "cursor-pointer";

    const button = (
      <button
        type="button"
        className={cn(
          dayCell,
          "relative flex size-full flex-col items-center justify-center gap-0 rounded-md text-xs font-normal",
          cursorClass,
          readOnly
            ? "hover:opacity-100"
            : "hover:opacity-90 focus-visible:outline-none",
          isDisabled && "opacity-50",
          className
        )}
        aria-label={(() => {
          const dayLabel =
            names.length > 0
              ? `${day.date.getDate()}, ${names.join(", ")}`
              : String(day.date.getDate());
          return isSelected ? `${dayLabel}, выбрано` : dayLabel;
        })()}
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

function createMonthNavButtons(monthsWithPossible: Set<string>) {
  function PreviousMonthButton(props: React.ComponentProps<"button">) {
    const { previousMonth, components } = useDayPicker();
    const showBadge =
      previousMonth !== undefined &&
      monthsWithPossible.has(monthKey(previousMonth));

    return (
      <components.Button
        {...props}
        className={cn(props.className, showBadge && "relative")}
      >
        {props.children}
        {showBadge && (
          <span
            className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
            aria-hidden
          />
        )}
      </components.Button>
    );
  }

  function NextMonthButton(props: React.ComponentProps<"button">) {
    const { nextMonth, components } = useDayPicker();
    const showBadge =
      nextMonth !== undefined && monthsWithPossible.has(monthKey(nextMonth));

    return (
      <components.Button
        {...props}
        className={cn(props.className, showBadge && "relative")}
      >
        {props.children}
        {showBadge && (
          <span
            className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
            aria-hidden
          />
        )}
      </components.Button>
    );
  }

  return { PreviousMonthButton, NextMonthButton };
}

function createPossibleDatesDropdowns(
  monthsWithPossible: Set<string>,
  yearsWithPossible: Set<number>
) {
  function MonthsDropdown(props: DropdownProps) {
    const { components, months } = useDayPicker();
    const currentYear = months[0]?.date.getFullYear();
    const options = props.options?.map((option) => ({
      ...option,
      disabled:
        option.disabled ||
        (currentYear !== undefined &&
          !monthsWithPossible.has(`${currentYear}-${option.value}`)),
    }));

    return <components.Dropdown {...props} options={options} />;
  }

  function YearsDropdown(props: DropdownProps) {
    const { components } = useDayPicker();
    const options = props.options?.map((option) => ({
      ...option,
      disabled: option.disabled || !yearsWithPossible.has(option.value),
    }));

    return <components.Dropdown {...props} options={options} />;
  }

  return { MonthsDropdown, YearsDropdown };
}

function createDayCell(dayBox: string) {
  function Day({ children, className, ...props }: React.ComponentProps<"td">) {
    return (
      <td className={className} {...props}>
        <span className={cn("flex items-center justify-center", dayBox)}>
          {children}
        </span>
      </td>
    );
  }

  return Day;
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
  defaultMonth: defaultMonthProp,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  const { dayColumn, weekdayCell, dayBox, gridWidth, cssVars, weekday } =
    CALENDAR_SIZES[size];
  const bestSet = new Set(bestDates);
  const selectedDateKeys = React.useMemo(() => {
    const dates =
      props.mode === "multiple" && Array.isArray(props.selected)
        ? props.selected
        : [];
    return new Set(dates.map(dateKey));
  }, [props.mode, props.mode === "multiple" ? props.selected : null]);
  const defaultMonth = defaultMonthProp ?? getDefaultMonth(possibleDates);
  const { startMonth, endMonth } = getCalendarMonthBounds(possibleDates);
  const monthsWithPossible = React.useMemo(
    () => getMonthsWithPossibleDates(possibleDates ?? []),
    [possibleDates]
  );
  const yearsWithPossible = React.useMemo(
    () => getYearsWithPossibleDates(possibleDates ?? []),
    [possibleDates]
  );
  const possibleDatesDropdowns = React.useMemo(
    () =>
      possibleDates !== undefined
        ? createPossibleDatesDropdowns(monthsWithPossible, yearsWithPossible)
        : null,
    [possibleDates, monthsWithPossible, yearsWithPossible]
  );
  const DayButton = React.useMemo(
    () =>
      createDayButton({
        size,
        participantsByDate,
        showParticipantTooltip,
        readOnly,
        currentUserName,
        selectedDateKeys,
      }),
    [
      size,
      participantsByDate,
      showParticipantTooltip,
      readOnly,
      currentUserName,
      selectedDateKeys,
    ]
  );
  const navButtons = React.useMemo(
    () => createMonthNavButtons(monthsWithPossible),
    [monthsWithPossible]
  );
  const Day = React.useMemo(() => createDayCell(dayBox), [dayBox]);

  return (
    <DayPicker
      locale={ruLocale}
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown"
      navLayout="around"
      defaultMonth={defaultMonth}
      startMonth={startMonth}
      endMonth={endMonth}
      className={cn("p-3", cssVars, className)}
      classNames={{
        root: cn("w-full md:w-fit", defaultClassNames.root),
        months: cn("flex flex-col sm:flex-row gap-4", defaultClassNames.months),
        month: cn("flex flex-col gap-4", defaultClassNames.month),
        month_caption: cn(
          "relative flex h-8! items-center justify-center",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "pointer-events-none select-none text-sm font-medium !outline-none",
          defaultClassNames.caption_label
        ),
        dropdowns: cn(
          "flex items-center justify-center gap-2 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative inline-flex h-8 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 data-[disabled=true]:cursor-not-allowed [&>span]:inline-flex [&>span]:items-center [&>span]:gap-1",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 cursor-pointer opacity-0 outline-none focus:outline-none focus-visible:outline-none",
          defaultClassNames.dropdown
        ),
        months_dropdown: cn(
          "h-8 cursor-pointer",
          defaultClassNames.months_dropdown
        ),
        years_dropdown: cn(
          "h-8 cursor-pointer",
          defaultClassNames.years_dropdown
        ),
        nav: cn("flex items-center gap-1", defaultClassNames.nav),
        button_previous: cn(
          "absolute start-1 top-0 z-10 inline-flex h-8! w-8 items-center justify-center self-center rounded-md bg-transparent p-0 opacity-50 hover:opacity-100 cursor-pointer aria-disabled:cursor-not-allowed disabled:cursor-not-allowed",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "absolute end-1 top-0 z-10 inline-flex h-8! w-8 items-center justify-center self-center rounded-md bg-transparent p-0 opacity-50 hover:opacity-100 cursor-pointer aria-disabled:cursor-not-allowed disabled:cursor-not-allowed",
          defaultClassNames.button_next
        ),
        month_grid: cn(
          gridWidth,
          "table-fixed border-collapse",
          defaultClassNames.month_grid
        ),
        weekdays: cn(defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground w-[14.285714%] p-0 !text-center font-normal align-middle",
          weekdayCell,
          weekday,
          defaultClassNames.weekday
        ),
        weeks: cn(defaultClassNames.weeks),
        week: cn(defaultClassNames.week),
        day: cn(
          "relative p-0 text-center text-sm align-middle",
          dayColumn,
          defaultClassNames.day
        ),
        day_button: cn("size-full", defaultClassNames.day_button),
        selected: defaultClassNames.selected,
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
        Day,
        ...navButtons,
        ...possibleDatesDropdowns,
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
        ...modifiersClassNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };

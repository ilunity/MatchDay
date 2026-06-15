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
  getCalendarYearDropdownBounds,
  getDefaultMonth,
  getEventPageYearDropdownOptions,
  getMonthsWithPossibleDates,
  getYearsWithPossibleDates,
  isYearInCalendarDropdownRange,
  monthKey,
} from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CALENDAR_SM_DAY_BUTTON_SIZE = 42;
const CALENDAR_LG_DAY_BUTTON_SIZE = 50;

const CALENDAR_SIZES = {
  sm: {
    dayCell: "shrink-0 rounded-md p-1.5",
    dayColumn: "h-auto p-0 md:h-[42px]",
    weekdayCell: "h-8 p-0",
    dayBox:
      "flex w-full aspect-square items-center justify-center md:aspect-auto md:size-[42px]",
    gridWidth: "w-full md:w-[294px]",
    cssVars:
      "[--rdp-day-height:auto] md:[--rdp-day-height:42px] [--rdp-weekday-padding:0] [--rdp-weekday-text-align:center]",
    dayNumber: "text-sm",
    participantCount: "text-[0.65rem]",
    weekday: "text-[0.8rem]",
    dayButtonSize: CALENDAR_SM_DAY_BUTTON_SIZE,
  },
  lg: {
    dayCell: "shrink-0 rounded-md p-1.5",
    dayColumn: "h-auto p-0",
    weekdayCell: "py-1.5",
    dayBox: "flex w-full aspect-square items-center justify-center",
    gridWidth: "w-full",
    cssVars:
      "[--rdp-day-height:auto] [--rdp-weekday-padding:0] [--rdp-weekday-text-align:center]",
    dayNumber: "text-lg",
    participantCount: "text-sm",
    weekday: "text-base",
    dayButtonSize: CALENDAR_LG_DAY_BUTTON_SIZE,
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
  highlightedDate: string | null;
  highlightKey: number;
};

function createDayButton({
  size,
  participantsByDate,
  showParticipantTooltip,
  readOnly,
  currentUserName,
  selectedDateKeys,
  highlightedDate,
  highlightKey,
}: DayButtonOptions) {
  const { dayCell, dayNumber, participantCount, dayButtonSize } =
    CALENDAR_SIZES[size];

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
    const isHighlighted = highlightedDate === key;

    const cursorClass = isDisabled
      ? "cursor-not-allowed"
      : readOnly
        ? showParticipantTooltip && names.length > 0
          ? "cursor-pointer"
          : "cursor-default"
        : "cursor-pointer";

    const button = (
      <button
        key={isHighlighted ? `highlight-${highlightKey}` : undefined}
        type="button"
        style={
          dayButtonSize
            ? {
                width: dayButtonSize,
                height: dayButtonSize,
                minWidth: dayButtonSize,
                minHeight: dayButtonSize,
              }
            : undefined
        }
        className={cn(
          dayCell,
          "relative flex flex-col items-center justify-center gap-0 text-xs font-normal",
          cursorClass,
          readOnly
            ? "hover:opacity-100"
            : "hover:opacity-90 focus-visible:outline-none",
          isDisabled && "opacity-50",
          isHighlighted && "calendar-day-highlight",
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
              {names.map((name) => {
                const isCurrentUser = currentUserName === name;
                return (
                  <li
                    key={name}
                    className={cn(
                      isCurrentUser &&
                        "font-medium text-green-600 dark:text-green-400"
                    )}
                  >
                    {name}
                    {isCurrentUser && ` ${ru.calendarParticipantYou}`}
                  </li>
                );
              })}
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

function CalendarCaptionDropdown({
  options,
  value,
  onChange,
  className,
  disabled,
  scrollAnchorValue,
  ...props
}: DropdownProps & { scrollAnchorValue?: string | number }) {
  const ariaLabel = props["aria-label"];
  const contentRef = React.useRef<HTMLDivElement>(null);
  const selected = options?.find(
    (option) => String(option.value) === String(value)
  );

  function handleSelect(optionValue: string | number) {
    onChange?.({
      target: { value: String(optionValue) },
    } as React.ChangeEvent<HTMLSelectElement>);
  }

  function handleOpenChange(open: boolean) {
    if (!open || scrollAnchorValue === undefined) {
      return;
    }
    requestAnimationFrame(() => {
      contentRef.current
        ?.querySelector(`[data-option-value="${scrollAnchorValue}"]`)
        ?.scrollIntoView({ block: "start" });
    });
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 min-w-0 max-w-full cursor-pointer items-center gap-1 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          aria-label={ariaLabel}
        >
          <span className="truncate">{selected?.label ?? value}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={contentRef}
        align="start"
        className="max-h-60 overflow-y-auto p-1"
      >
        {options?.map((option) => (
          <DropdownMenuItem
            key={option.value}
            data-option-value={option.value}
            disabled={option.disabled}
            className={cn(
              String(option.value) === String(value) && "bg-accent font-medium"
            )}
            onSelect={() => handleSelect(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function createCalendarDropdowns(
  monthsWithPossible: Set<string>,
  yearsWithPossible: Set<number>,
  restrictToPossibleDates: boolean
) {
  function MonthsDropdown(props: DropdownProps) {
    const { components, months } = useDayPicker();
    const currentYear = months[0]?.date.getFullYear();
    const options =
      restrictToPossibleDates && currentYear !== undefined
        ? props.options?.map((option) => ({
            ...option,
            disabled:
              option.disabled ||
              !monthsWithPossible.has(`${currentYear}-${option.value}`),
          }))
        : props.options;

    return <components.Dropdown {...props} options={options} />;
  }

  function YearsDropdown(props: DropdownProps) {
    const currentYear = new Date().getFullYear();

    if (restrictToPossibleDates) {
      const options = getEventPageYearDropdownOptions(
        yearsWithPossible,
        props.options
      );
      const selectedYear = Number(props.value);
      const scrollAnchorValue = options.some(
        (option) => option.value === selectedYear && !option.disabled
      )
        ? selectedYear
        : (options.find((option) => !option.disabled)?.value ?? currentYear);

      return (
        <CalendarCaptionDropdown
          {...props}
          options={options}
          scrollAnchorValue={scrollAnchorValue}
        />
      );
    }

    const options = props.options?.filter((option) =>
      isYearInCalendarDropdownRange(Number(option.value))
    );

    return (
      <CalendarCaptionDropdown
        {...props}
        options={options}
        scrollAnchorValue={currentYear}
      />
    );
  }

  return { MonthsDropdown, YearsDropdown };
}

function isWeekendWeekday(label: React.ReactNode): boolean {
  return label === "сб" || label === "вс";
}

function Weekday({ className, children, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(className, isWeekendWeekday(children) && "font-medium text-destructive")}
      {...props}
    >
      {children}
    </th>
  );
}

function createDayCell(dayBox: string) {
  function Day({ children, className, ...props }: React.ComponentProps<"td">) {
    return (
      <td className={className} {...props}>
        <div className="flex w-full justify-center">
          <span className={cn("flex items-center justify-center", dayBox)}>
            {children}
          </span>
        </div>
      </td>
    );
  }

  return Day;
}

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  size?: CalendarSize;
  possibleDates?: Date[];
  /** Limit month/year navigation to possibleDates (event page). Default: when possibleDates is set. */
  restrictToPossibleDates?: boolean;
  bestDates?: string[];
  participantsByDate?: Record<string, string[]>;
  showParticipantTooltip?: boolean;
  readOnly?: boolean;
  currentUserName?: string;
  highlightedDate?: string | null;
  highlightKey?: number;
};

function Calendar({
  className,
  classNames,
  size = "lg",
  showOutsideDays = true,
  possibleDates,
  restrictToPossibleDates = possibleDates !== undefined,
  bestDates = [],
  participantsByDate = {},
  showParticipantTooltip = false,
  readOnly = false,
  currentUserName,
  highlightedDate = null,
  highlightKey = 0,
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
  const monthBounds = restrictToPossibleDates
    ? getCalendarMonthBounds(possibleDates)
    : getCalendarYearDropdownBounds();
  const monthsWithPossible = React.useMemo(
    () =>
      restrictToPossibleDates
        ? getMonthsWithPossibleDates(possibleDates ?? [])
        : new Set<string>(),
    [restrictToPossibleDates, possibleDates]
  );
  const yearsWithPossible = React.useMemo(
    () =>
      restrictToPossibleDates
        ? getYearsWithPossibleDates(possibleDates ?? [])
        : new Set<number>(),
    [restrictToPossibleDates, possibleDates]
  );
  const calendarDropdowns = React.useMemo(
    () =>
      createCalendarDropdowns(
        monthsWithPossible,
        yearsWithPossible,
        restrictToPossibleDates
      ),
    [monthsWithPossible, yearsWithPossible, restrictToPossibleDates]
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
        highlightedDate,
        highlightKey,
      }),
    [
      size,
      participantsByDate,
      showParticipantTooltip,
      readOnly,
      currentUserName,
      selectedDateKeys,
      highlightedDate,
      highlightKey,
    ]
  );
  const navButtons = React.useMemo(
    () =>
      restrictToPossibleDates
        ? createMonthNavButtons(monthsWithPossible)
        : {},
    [restrictToPossibleDates, monthsWithPossible]
  );
  const Day = React.useMemo(() => createDayCell(dayBox), [dayBox]);

  return (
    <DayPicker
      locale={ruLocale}
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown"
      navLayout="around"
      defaultMonth={defaultMonth}
      startMonth={monthBounds.startMonth}
      endMonth={monthBounds.endMonth}
      className={cn(
        "rounded-md border border-border bg-background p-3",
        size === "lg" && "calendar-fluid",
        cssVars,
        className
      )}
      classNames={{
        root: cn(
          "w-full",
          size === "sm" && "md:w-fit",
          defaultClassNames.root
        ),
        months: cn("flex flex-col sm:flex-row gap-4", defaultClassNames.months),
        month: cn("flex flex-col gap-4", defaultClassNames.month),
        month_caption: cn(
          "relative flex h-8! items-center justify-center",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "sr-only",
          defaultClassNames.caption_label
        ),
        dropdowns: cn(
          "flex items-center justify-center gap-2 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative inline-flex",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("inline-flex", defaultClassNames.dropdown),
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
          "table-fixed border-collapse overflow-hidden rounded-sm border border-border",
          defaultClassNames.month_grid
        ),
        weekdays: cn(defaultClassNames.weekdays),
        weekday: cn(
          "border border-border text-muted-foreground w-[14.285714%] p-0 !text-center font-normal align-middle",
          weekdayCell,
          weekday,
          defaultClassNames.weekday
        ),
        weeks: cn(defaultClassNames.weeks),
        week: cn(defaultClassNames.week),
        day: cn(
          "relative border border-border p-0 text-center text-sm align-middle",
          dayColumn,
          defaultClassNames.day
        ),
        day_button: defaultClassNames.day_button,
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
        Dropdown: CalendarCaptionDropdown,
        DayButton,
        Day,
        Weekday,
        ...navButtons,
        ...calendarDropdowns,
        ...components,
      }}
      modifiers={{
        ...(restrictToPossibleDates
          ? { possible: possibleDates ?? [] }
          : {}),
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

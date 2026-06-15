export function normalizeDate(date: Date): Date {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function normalizeDates(dates: Date[]): Date[] {
  return dates.map(normalizeDate);
}

export function dateKey(date: Date): string {
  return normalizeDate(date).toISOString().slice(0, 10);
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDateRu(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateShortRu(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateDotRu(date: Date): string {
  const d = normalizeDate(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

export function formatMonthYearRu(date: Date): string {
  const d = normalizeDate(date);
  const month = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    timeZone: "UTC",
  }).format(d);
  return `${month} ${d.getUTCFullYear()}`;
}

export function formatWeekRangeRu(start: Date, end: Date): string {
  const startNorm = normalizeDate(start);
  const endNorm = normalizeDate(end);
  const startDay = startNorm.getUTCDate();
  const endDay = endNorm.getUTCDate();

  if (startNorm.getUTCMonth() === endNorm.getUTCMonth()) {
    const month = new Intl.DateTimeFormat("ru-RU", {
      month: "long",
      timeZone: "UTC",
    }).format(startNorm);
    return `${startDay}–${endDay} ${month}`;
  }

  const startMonth = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    timeZone: "UTC",
  }).format(startNorm);
  const endMonth = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    timeZone: "UTC",
  }).format(endNorm);
  return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
}

export function getToday(): Date {
  return normalizeDate(new Date());
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function getDefaultMonth(possibleDates?: Date[]): Date {
  if (!possibleDates?.length) {
    return new Date();
  }
  return new Date(Math.min(...possibleDates.map((d) => d.getTime())));
}

export function getMonthsWithPossibleDates(possibleDates: Date[]): Set<string> {
  return new Set(possibleDates.map(monthKey));
}

export function getYearsWithPossibleDates(possibleDates: Date[]): Set<number> {
  return new Set(possibleDates.map((date) => date.getFullYear()));
}

export const CALENDAR_YEAR_FORWARD_RANGE = 100;

export function getCalendarYearDropdownBounds(): {
  startMonth: Date;
  endMonth: Date;
} {
  const currentYear = new Date().getFullYear();
  return {
    startMonth: new Date(currentYear, 0, 1),
    endMonth: new Date(currentYear + CALENDAR_YEAR_FORWARD_RANGE, 11, 1),
  };
}

export function isYearInCalendarDropdownRange(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return (
    year >= currentYear && year <= currentYear + CALENDAR_YEAR_FORWARD_RANGE
  );
}

export function getEventPageYearDropdownOptions(
  yearsWithPossible: Set<number>,
  sourceOptions?: ReadonlyArray<{
    value: number | string;
    label: unknown;
    disabled?: boolean;
  }>
): Array<{ value: number; label: string; disabled: boolean }> {
  if (yearsWithPossible.size === 0) {
    return [];
  }

  const sortedYears = Array.from(yearsWithPossible).sort((a, b) => a - b);
  const minYear = sortedYears[0]!;
  const maxYear = sortedYears[sortedYears.length - 1]!;
  const labelByValue = new Map(
    sourceOptions?.map((option) => [Number(option.value), String(option.label)]) ??
      []
  );

  const options: Array<{ value: number; label: string; disabled: boolean }> =
    [];
  for (let year = minYear; year <= maxYear; year++) {
    options.push({
      value: year,
      label: labelByValue.get(year) ?? String(year),
      disabled: !yearsWithPossible.has(year),
    });
  }

  return options;
}

export function getCalendarMonthBounds(possibleDates?: Date[]): {
  startMonth: Date;
  endMonth: Date;
} {
  const today = new Date();
  let startMonth = new Date(today.getFullYear() - 2, 0, 1);
  let endMonth = new Date(today.getFullYear() + 2, 11, 1);

  if (possibleDates?.length) {
    for (const date of possibleDates) {
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      if (monthStart < startMonth) {
        startMonth = monthStart;
      }
      if (monthStart > endMonth) {
        endMonth = monthStart;
      }
    }
  }

  return { startMonth, endMonth };
}

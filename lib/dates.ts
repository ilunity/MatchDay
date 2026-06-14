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

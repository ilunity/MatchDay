import {
  dateKey,
  getToday,
  normalizeDate,
  normalizeDates,
} from "@/lib/dates";

export type DatePresetId =
  | "allWeekendsOfMonth"
  | "allWeekdaysOfMonth"
  | "allDaysOfMonth"
  | "next2Weeks"
  | "next4Weeks"
  | "next3Weekends"
  | "thisWeek"
  | "nextWeek";

function getMondayBasedDay(date: Date): number {
  const dow = date.getUTCDay();
  return dow === 0 ? 6 : dow - 1;
}

function isWeekend(date: Date): boolean {
  const dow = date.getUTCDay();
  return dow === 0 || dow === 6;
}

function isWeekday(date: Date): boolean {
  return !isWeekend(date);
}

function isOnOrAfter(date: Date, reference: Date): boolean {
  return dateKey(date) >= dateKey(reference);
}

export function filterTodayAndFuture(
  dates: Date[],
  today = getToday()
): Date[] {
  return dates.filter((date) => isOnOrAfter(date, today));
}

function getDaysInMonth(year: number, month: number): Date[] {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const days: Date[] = [];
  for (let day = 1; day <= lastDay; day++) {
    days.push(normalizeDate(new Date(year, month, day)));
  }
  return days;
}

function getNextNDays(count: number, today = getToday()): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + i);
    dates.push(normalizeDate(date));
  }
  return dates;
}

function getNextNWeekendDays(count: number, today = getToday()): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(today);
  while (dates.length < count) {
    if (isWeekend(cursor)) {
      dates.push(normalizeDate(new Date(cursor)));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function getThisWeekRemaining(today = getToday()): Date[] {
  const daysUntilSunday = 6 - getMondayBasedDay(today);
  return getNextNDays(daysUntilSunday + 1, today);
}

function getNextCalendarWeek(today = getToday()): Date[] {
  const daysUntilNextMonday = 7 - getMondayBasedDay(today);
  const nextMonday = new Date(today);
  nextMonday.setUTCDate(today.getUTCDate() + daysUntilNextMonday);
  return getNextNDays(7, nextMonday);
}

export function computePresetDates(
  presetId: DatePresetId,
  options: { visibleMonth: Date; today?: Date }
): Date[] {
  const today = options.today ?? getToday();
  const year = options.visibleMonth.getFullYear();
  const month = options.visibleMonth.getMonth();

  let dates: Date[];

  switch (presetId) {
    case "allWeekendsOfMonth":
      dates = getDaysInMonth(year, month).filter(isWeekend);
      break;
    case "allWeekdaysOfMonth":
      dates = getDaysInMonth(year, month).filter(isWeekday);
      break;
    case "allDaysOfMonth":
      dates = getDaysInMonth(year, month);
      break;
    case "next2Weeks":
      dates = getNextNDays(14, today);
      break;
    case "next4Weeks":
      dates = getNextNDays(28, today);
      break;
    case "next3Weekends":
      dates = getNextNWeekendDays(6, today);
      break;
    case "thisWeek":
      dates = getThisWeekRemaining(today);
      break;
    case "nextWeek":
      dates = getNextCalendarWeek(today);
      break;
  }

  return filterTodayAndFuture(dates, today);
}

export function mergeDates(existing: Date[], toAdd: Date[]): Date[] {
  const keys = new Set(existing.map(dateKey));
  const merged = [...existing];
  for (const date of toAdd) {
    const key = dateKey(date);
    if (!keys.has(key)) {
      keys.add(key);
      merged.push(normalizeDate(date));
    }
  }
  return normalizeDates(merged).sort((a, b) => a.getTime() - b.getTime());
}

export const DATE_PRESET_IDS: DatePresetId[] = [
  "thisWeek",
  "nextWeek",
  "next2Weeks",
  "next4Weeks",
  "next3Weekends",
  "allWeekendsOfMonth",
  "allWeekdaysOfMonth",
  "allDaysOfMonth",
];

import { dateKey, normalizeDate, parseDateKey } from "@/lib/dates";

/** Сохраняет голоса за даты вне possibleDates и обновляет выбор по активным датам. */
export function mergeAvailabilityOnSave(
  existingDates: Date[],
  selectedKeys: string[],
  possibleDateKeys: Set<string>
): Date[] {
  const preserved = existingDates.filter(
    (date) => !possibleDateKeys.has(dateKey(date))
  );
  const selected = selectedKeys
    .filter((key) => possibleDateKeys.has(key))
    .map(parseDateKey);

  const seen = new Set<string>();
  const merged: Date[] = [];

  for (const date of [...preserved, ...selected]) {
    const key = dateKey(date);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(normalizeDate(date));
  }

  return merged;
}

/** Даты доступности, видимые участнику в календаре (только из possibleDates). */
export function filterAvailabilityForCalendar(
  availableDates: Date[],
  possibleDateKeys: Set<string>
): Date[] {
  return availableDates.filter((date) => possibleDateKeys.has(dateKey(date)));
}

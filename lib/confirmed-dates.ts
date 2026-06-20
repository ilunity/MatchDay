import { ru } from "@/lib/i18n/ru";
import type { ConfirmationMode } from "@/lib/validations/confirmation";

export function formatConfirmedDatesBadge(count: number): string {
  if (count === 0) return ru.eventScheduling;
  if (count === 1) return ru.confirmedDateBadge(1);
  if (count >= 2 && count <= 4) return ru.confirmedDatesBadgeFew(count);
  return ru.confirmedDatesBadgeMany(count);
}

export function getConfirmedDateTooltip(
  mode: ConfirmationMode | null
): string {
  return mode === "all"
    ? ru.confirmedDateTooltipAll
    : ru.confirmedDateTooltipOneOf;
}

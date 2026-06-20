"use client";

import type { ConfirmationMode } from "@/lib/validations/confirmation";
import { ru } from "@/lib/i18n/ru";
import { cn } from "@/lib/utils";

type ConfirmationModeSelectorProps = {
  value: ConfirmationMode;
  onChange: (mode: ConfirmationMode) => void;
  disabled?: boolean;
  className?: string;
};

const MODES: Array<{
  value: ConfirmationMode;
  label: string;
  hint: string;
}> = [
  {
    value: "all",
    label: ru.confirmationModeAll,
    hint: ru.confirmationModeAllHint,
  },
  {
    value: "one_of",
    label: ru.confirmationModeOneOf,
    hint: ru.confirmationModeOneOfHint,
  },
];

export function ConfirmationModeSelector({
  value,
  onChange,
  disabled = false,
  className,
}: ConfirmationModeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ru.confirmDates}
      className={cn("grid gap-2 sm:grid-cols-2", className)}
    >
      {MODES.map((mode) => {
        const isSelected = value === mode.value;
        return (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(mode.value)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <span className="block text-sm font-medium">{mode.label}</span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {mode.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}

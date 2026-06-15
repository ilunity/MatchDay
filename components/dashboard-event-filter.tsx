import Link from "next/link";
import type { DashboardEventFilter } from "@/actions/events";
import { buttonVariants } from "@/components/ui/button";
import { ru } from "@/lib/i18n/ru";
import { cn } from "@/lib/utils";

const filters: { value: DashboardEventFilter; label: string }[] = [
  { value: "all", label: ru.dashboardFilterAll },
  { value: "owned", label: ru.dashboardFilterOwned },
  { value: "participated", label: ru.dashboardFilterParticipated },
];

type DashboardEventFilterProps = {
  active: DashboardEventFilter;
};

export function DashboardEventFilter({ active }: DashboardEventFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ value, label }) => (
        <Link
          key={value}
          href={value === "all" ? "/dashboard" : `/dashboard?filter=${value}`}
          className={cn(
            buttonVariants({
              variant: active === value ? "default" : "outline",
              size: "sm",
            })
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

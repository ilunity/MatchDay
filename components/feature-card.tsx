import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FeatureVariant = "create" | "share" | "results";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  variant: FeatureVariant;
};

const variantStyles: Record<
  FeatureVariant,
  {
    gradient: string;
    iconWrap: string;
    icon: string;
    glow: string;
  }
> = {
  create: {
    gradient: "from-blue-500/20 via-sky-400/5 to-transparent dark:from-blue-500/25 dark:via-blue-400/10",
    iconWrap: "bg-blue-500/10 ring-blue-500/25 dark:bg-blue-400/15 dark:ring-blue-400/30",
    icon: "text-blue-600 dark:text-blue-400",
    glow: "bg-blue-500/20 dark:bg-blue-400/15",
  },
  share: {
    gradient: "from-violet-500/20 via-purple-400/5 to-transparent dark:from-violet-500/25 dark:via-violet-400/10",
    iconWrap: "bg-violet-500/10 ring-violet-500/25 dark:bg-violet-400/15 dark:ring-violet-400/30",
    icon: "text-violet-600 dark:text-violet-400",
    glow: "bg-violet-500/20 dark:bg-violet-400/15",
  },
  results: {
    gradient: "from-emerald-500/20 via-teal-400/5 to-transparent dark:from-emerald-500/25 dark:via-emerald-400/10",
    iconWrap: "bg-emerald-500/10 ring-emerald-500/25 dark:bg-emerald-400/15 dark:ring-emerald-400/30",
    icon: "text-emerald-600 dark:text-emerald-400",
    glow: "bg-emerald-500/20 dark:bg-emerald-400/15",
  },
};

function FeatureDecoration({ variant }: { variant: FeatureVariant }) {
  if (variant === "create") {
    return (
      <svg
        viewBox="0 0 120 80"
        className="absolute -right-2 top-1 h-20 w-28 opacity-40 dark:opacity-25"
        aria-hidden="true"
      >
        <rect x="12" y="8" width="96" height="64" rx="8" fill="currentColor" className="text-blue-500/30" />
        <rect x="12" y="8" width="96" height="18" rx="8" fill="currentColor" className="text-blue-500/50" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x={20 + (i % 3) * 28}
            y={34 + Math.floor(i / 3) * 22}
            width="18"
            height="14"
            rx="3"
            fill="currentColor"
            className={i === 2 ? "text-blue-500/70" : "text-blue-500/25"}
          />
        ))}
      </svg>
    );
  }

  if (variant === "share") {
    return (
      <svg
        viewBox="0 0 120 80"
        className="absolute -right-1 top-2 h-20 w-28 opacity-40 dark:opacity-25"
        aria-hidden="true"
      >
        <circle cx="88" cy="24" r="10" fill="currentColor" className="text-violet-500/50" />
        <circle cx="32" cy="56" r="10" fill="currentColor" className="text-violet-500/35" />
        <circle cx="72" cy="58" r="10" fill="currentColor" className="text-violet-500/70" />
        <path
          d="M80 28 L38 50 M80 28 L66 52"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
          className="text-violet-500/40"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 120 80"
      className="absolute -right-1 top-3 h-20 w-28 opacity-40 dark:opacity-25"
      aria-hidden="true"
    >
      {[18, 32, 46, 60].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={58 - [20, 34, 26, 44][i]}
          width="10"
          height={[20, 34, 26, 44][i]}
          rx="2"
          fill="currentColor"
          className={i === 3 ? "text-emerald-500/70" : "text-emerald-500/30"}
        />
      ))}
      <path
        d="M16 58 L78 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-emerald-500/45"
        fill="none"
      />
    </svg>
  );
}

export function FeatureCard({ title, description, icon: Icon, variant }: FeatureCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div
        className={cn("relative bg-gradient-to-br px-6 pb-5 pt-6", styles.gradient)}
        aria-hidden="true"
      >
        <div
          className={cn(
            "pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full blur-2xl",
            styles.glow
          )}
        />
        <FeatureDecoration variant={variant} />
        <div
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset",
            styles.iconWrap
          )}
        >
          <Icon className={cn("h-7 w-7", styles.icon)} strokeWidth={1.75} />
        </div>
      </div>
      <CardHeader className="space-y-2 pb-2 pt-5">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

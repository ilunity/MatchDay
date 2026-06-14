import { formatDateShortRu, parseDateKey } from "@/lib/dates";
import { ru } from "@/lib/i18n/ru";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Stat = { date: string; count: number };

export function DateStats({
  stats,
  totalParticipants,
}: {
  stats: Stat[];
  totalParticipants: number;
}) {
  const maxCount = stats[0]?.count ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{ru.bestDates}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {ru.bestDatesHint} · {ru.totalParticipants}: {totalParticipants}
        </p>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <p className="text-sm text-muted-foreground">{ru.noAvailability}</p>
        ) : (
          <ul className="space-y-3">
            {stats.map((stat) => {
              const pct = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
              return (
                <li key={stat.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {formatDateShortRu(parseDateKey(stat.date))}
                    </span>
                    <span className="text-muted-foreground">
                      {stat.count}{" "}
                      {stat.count === 1
                        ? ru.participant
                        : stat.count < 5
                          ? "участника"
                          : ru.participants}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

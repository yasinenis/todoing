import { Check, Flame, Minus, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { today } from "@/lib/date";
import { playSound } from "@/lib/sound";
import { hexToRgba } from "@/lib/colors";
import { useHabits, useHabitLogs, useSetHabitLog } from "@/features/habits/api";

/** Panelde bugün yapılması beklenen alışkanlıklar; buradan işaretlenebilir. */
export function TodayHabits() {
  const { data: habits } = useHabits();
  const { data: logs } = useHabitLogs();
  const setLog = useSetHabitLog();
  const todayStr = today();

  const visible = (habits ?? []).filter((h) => !h.archived);
  if (visible.length === 0) return null;

  const countOf = (habitId: string) =>
    logs?.find((l) => l.habit_id === habitId && l.day === todayStr)?.count ?? 0;

  const mark = (habitId: string, next: number, target: number, cur: number) => {
    playSound(next >= target && next > cur ? "success" : "tap");
    setLog.mutate({ habit_id: habitId, day: todayStr, count: Math.max(0, next) });
  };

  const doneCount = visible.filter(
    (h) => countOf(h.id) >= h.target_per_day,
  ).length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Bugünün alışkanlıkları</CardTitle>
        <span className="text-sm text-muted-foreground">
          {doneCount}/{visible.length}
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        {visible.map((h) => {
          const cur = countOf(h.id);
          const done = cur >= h.target_per_day;
          return (
            <div
              key={h.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-2.5 transition-colors",
                done && "bg-success/5",
              )}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: hexToRgba(h.color, 0.18) }}
              >
                <Flame className="h-4 w-4" style={{ color: h.color }} />
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-sm font-medium",
                  done && "text-muted-foreground line-through",
                )}
              >
                {h.name}
              </span>

              {h.target_per_day === 1 ? (
                <Button
                  size="icon"
                  variant={done ? "default" : "outline"}
                  className="h-8 w-8 shrink-0"
                  onClick={() => mark(h.id, done ? 0 : 1, 1, cur)}
                  disabled={setLog.isPending}
                  aria-label="Yaptım"
                >
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => mark(h.id, cur - 1, h.target_per_day, cur)}
                    disabled={setLog.isPending || cur <= 0}
                    aria-label="Azalt"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span
                    className={cn(
                      "w-10 text-center text-sm font-medium tabular-nums",
                      done && "text-success",
                    )}
                  >
                    {cur}/{h.target_per_day}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => mark(h.id, cur + 1, h.target_per_day, cur)}
                    disabled={setLog.isPending}
                    aria-label="Artır"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

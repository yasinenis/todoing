import { Check, Flame, Minus, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { today } from "@/lib/date";
import { hexToRgba } from "@/lib/colors";
import type { Habit } from "@/lib/database.types";
import { ContributionHeatmap } from "./contribution-heatmap";
import { completionRate, computeStreaks } from "./habit-stats";
import { useSetHabitLog } from "./api";

interface Props {
  habit: Habit;
  logs: Map<string, number>;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export function HabitCard({ habit, logs, onEdit, onDelete }: Props) {
  const setLog = useSetHabitLog();
  const todayStr = today();
  const todayCount = logs.get(todayStr) ?? 0;
  const target = habit.target_per_day;
  const complete = todayCount >= target;

  const { current, best } = computeStreaks(logs, target);
  const rate = completionRate(logs, target, 30);

  const setCount = (next: number) =>
    setLog.mutate({ habit_id: habit.id, day: todayStr, count: next });

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: hexToRgba(habit.color, 0.2) }}
            >
              <Flame className="h-5 w-5" style={{ color: habit.color }} />
            </span>
            <div>
              <h3 className="font-semibold leading-tight">{habit.name}</h3>
              <p className="text-xs text-muted-foreground">
                Günlük hedef: {target}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {target === 1 ? (
              <Button
                size="icon"
                variant={complete ? "default" : "outline"}
                onClick={() => setCount(complete ? 0 : 1)}
                disabled={setLog.isPending}
                aria-label="Bugünü işaretle"
              >
                <Check className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => setCount(Math.max(0, todayCount - 1))}
                  disabled={setLog.isPending || todayCount <= 0}
                  aria-label="Azalt"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span
                  className={cn(
                    "w-12 text-center text-sm font-medium tabular-nums",
                    complete && "text-success",
                  )}
                >
                  {todayCount}/{target}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => setCount(todayCount + 1)}
                  disabled={setLog.isPending}
                  aria-label="Artır"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Daha fazla">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(habit)}>
                  <Pencil className="h-4 w-4" /> Düzenle
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(habit)}
                >
                  <Trash2 className="h-4 w-4" /> Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <Stat label="Seri" value={`${current} gün`} accent={habit.color} />
          <Stat label="En iyi" value={`${best} gün`} />
          <Stat label="Son 30g" value={`%${rate}`} />
        </div>

        <ContributionHeatmap
          color={habit.color}
          logs={logs}
          target={target}
        />
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <p
        className="text-base font-semibold"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

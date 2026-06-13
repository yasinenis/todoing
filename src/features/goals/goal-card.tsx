import { differenceInCalendarDays } from "date-fns";
import { Minus, Plus, MoreVertical, Pencil, Trash2, Flag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatLong, fromDayStr } from "@/lib/date";
import { UNCATEGORIZED } from "@/lib/colors";
import type { Category, Goal } from "@/lib/database.types";
import { TIMEFRAME_LABELS } from "./goal-meta";
import { useUpdateGoal } from "./api";

interface Props {
  goal: Goal;
  category?: Category;
  /** Bağlı görev istatistikleri (otomatik ilerleme için). */
  linked: { total: number; done: number };
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

function remainingLabel(targetDate: string): { text: string; overdue: boolean } {
  const days = differenceInCalendarDays(fromDayStr(targetDate), new Date());
  if (days > 0) return { text: `${days} gün kaldı`, overdue: false };
  if (days === 0) return { text: "Bugün son gün", overdue: false };
  return { text: `${Math.abs(days)} gün gecikti`, overdue: true };
}

export function GoalCard({ goal, category, linked, onEdit, onDelete }: Props) {
  const update = useUpdateGoal();
  const cat = category ?? UNCATEGORIZED;

  const progress = goal.auto_progress
    ? linked.total > 0
      ? Math.round((linked.done / linked.total) * 100)
      : 0
    : goal.progress;

  const { text: remaining, overdue } = remainingLabel(goal.target_date);
  const completed = progress >= 100;

  const setProgress = (next: number) => {
    const clamped = Math.min(100, Math.max(0, next));
    update.mutate({
      id: goal.id,
      progress: clamped,
      status: clamped >= 100 ? "completed" : "active",
    });
  };

  return (
    <Card className={cn(completed && "border-success/50")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{TIMEFRAME_LABELS[goal.timeframe]}</Badge>
              {completed && <Badge variant="success">Tamamlandı</Badge>}
            </div>
            <h3 className="mt-1.5 truncate font-semibold">{goal.title}</h3>
            {goal.description && (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {goal.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Daha fazla">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Pencil className="h-4 w-4" /> Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(goal)}
              >
                <Trash2 className="h-4 w-4" /> Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">%{progress}</span>
            {goal.auto_progress && (
              <span className="text-xs text-muted-foreground">
                {linked.done}/{linked.total} görev
              </span>
            )}
          </div>
          <Progress
            value={progress}
            indicatorClassName={completed ? "bg-success" : undefined}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </span>
            <span className={cn("flex items-center gap-1", overdue && "text-destructive")}>
              <Flag className="h-3 w-3" /> {remaining}
            </span>
          </div>

          {!goal.auto_progress && (
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                onClick={() => setProgress(progress - 10)}
                disabled={update.isPending || progress <= 0}
                aria-label="Azalt"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                onClick={() => setProgress(progress + 10)}
                disabled={update.isPending || progress >= 100}
                aria-label="Artır"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Hedef: {formatLong(goal.target_date)}
        </p>
      </CardContent>
    </Card>
  );
}

import { Pause, Play, MoreVertical, Pencil, Trash2, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDuration } from "@/lib/utils";
import { formatShort } from "@/lib/date";
import { UNCATEGORIZED } from "@/lib/colors";
import type { Category, Task } from "@/lib/database.types";
import { useTimer } from "@/features/timer/timer-provider";
import { PRIORITY_BADGE, PRIORITY_LABELS } from "./task-meta";
import { useToggleTaskDone } from "./api";

interface Props {
  task: Task;
  category?: Category;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, category, onEdit, onDelete }: Props) {
  const { activeTaskId, isRunning, liveElapsed, isPending, start, pause } =
    useTimer();
  const toggle = useToggleTaskDone();

  const isActive = activeTaskId === task.id;
  const isThisRunning = isActive && isRunning;
  const total = task.total_seconds + (isActive ? liveElapsed : 0);
  const done = task.status === "done";
  const cat = category ?? UNCATEGORIZED;

  return (
    <Card
      className={cn(
        "flex items-center gap-3 p-4 transition-colors",
        isActive && "ring-2 ring-primary/40",
        done && "opacity-60",
      )}
    >
      <Checkbox
        checked={done}
        onCheckedChange={() => toggle.mutate(task)}
        aria-label="Tamamlandı"
      />

      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-medium", done && "line-through")}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            {cat.name}
          </span>
          <Badge variant={PRIORITY_BADGE[task.priority]} className="px-2 py-0">
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          {task.due_date && (
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              {formatShort(task.due_date)}
            </span>
          )}
          {total > 0 && (
            <span className="font-mono tabular-nums">
              ⏱ {formatDuration(total, true)}
            </span>
          )}
        </div>
      </div>

      {!done && (
        <Button
          size="icon"
          variant={isThisRunning ? "secondary" : "default"}
          onClick={() => (isThisRunning ? pause() : start(task.id))}
          disabled={isPending}
          aria-label={isThisRunning ? "Duraklat" : "Sayacı başlat"}
        >
          {isThisRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Daha fazla">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Pencil className="h-4 w-4" /> Düzenle
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(task)}
          >
            <Trash2 className="h-4 w-4" /> Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}

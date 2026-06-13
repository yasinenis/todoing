import { Pause, Play, Square, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import { useTasks } from "@/features/tasks/api";
import { useTimer } from "./timer-provider";

/**
 * Tüm sayfalarda görünen yüzen aktif sayaç. Görevin toplam süresini
 * (kayıtlı + canlı oturum) gösterir; duraklat/devam/bitir kontrolleri sunar.
 */
export function TimerWidget() {
  const { activeTaskId, isRunning, liveElapsed, isPending, pause, resume, stop } =
    useTimer();
  const { data: tasks } = useTasks();

  if (!activeTaskId) return null;

  const task = tasks?.find((t) => t.id === activeTaskId);
  const totalSeconds = (task?.total_seconds ?? 0) + liveElapsed;

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6 animate-fade-in">
      <div className="flex items-center gap-3 rounded-2xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
        <div
          className={
            "flex h-9 w-9 items-center justify-center rounded-xl " +
            (isRunning
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground")
          }
        >
          <TimerIcon className={isRunning ? "h-5 w-5 animate-pulse" : "h-5 w-5"} />
        </div>
        <div className="min-w-0">
          <p className="max-w-[10rem] truncate text-sm font-medium">
            {task?.title ?? "Görev"}
          </p>
          <p className="font-mono text-sm tabular-nums text-muted-foreground">
            {formatDuration(totalSeconds, true)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isRunning ? (
            <Button
              size="icon"
              variant="secondary"
              onClick={() => pause()}
              disabled={isPending}
              aria-label="Duraklat"
            >
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={() => resume()}
              disabled={isPending}
              aria-label="Devam et"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => stop()}
            disabled={isPending}
            aria-label="Bitir ve kaydet"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

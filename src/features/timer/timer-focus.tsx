import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import { useTasks } from "@/features/tasks/api";
import { useTimer, liveElapsedSeconds } from "./timer-provider";

/**
 * Tam ekran odak modu. Sayaç aktifken (bir görev sayılırken) o sekmeyi
 * tamamen kaplar; altındaki uygulama erişilemez kalır. Yalnızca "Bitir" ile
 * kapanır (duraklatınca açık kalır).
 */
export function TimerFocus() {
  const {
    activeTimer,
    activeTaskId,
    isRunning,
    liveElapsed,
    isPending,
    pause,
    resume,
    stop,
  } = useTimer();
  const { data: tasks } = useTasks();

  if (!activeTaskId) return null;

  const task = tasks?.find((t) => t.id === activeTaskId);
  const sessionElapsed = activeTimer
    ? Math.round(liveElapsedSeconds(activeTimer, Date.now()))
    : 0;
  const totalSeconds = (task?.total_seconds ?? 0) + liveElapsed;

  return (
    <div
      className="fixed inset-0 z-[100] flex animate-fade-in flex-col items-center justify-center gap-10 bg-gradient-to-br from-primary/10 via-background to-accent/20 px-6 py-10 safe-top safe-bottom"
      role="dialog"
      aria-modal="true"
    >
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Odak modu
        </p>
        <h2 className="mt-2 text-2xl font-bold md:text-4xl">
          {task?.title ?? "Görev"}
        </h2>
      </div>

      {/* Büyük dairesel sayaç */}
      <div
        className={cn(
          "relative flex aspect-square w-72 max-w-[80vw] items-center justify-center rounded-full border-4 transition-colors md:w-[26rem]",
          isRunning ? "border-primary bg-primary/5" : "border-muted bg-muted/30",
        )}
      >
        {isRunning && (
          <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary/30" />
        )}
        <div className="text-center">
          <p className="font-mono text-6xl font-bold tabular-nums md:text-8xl">
            {formatDuration(totalSeconds, true)}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {isRunning ? "Çalışıyor" : "Duraklatıldı"} · bu oturum{" "}
            {formatDuration(sessionElapsed, true)}
          </p>
        </div>
      </div>

      {/* Kontroller */}
      <div className="flex w-full max-w-md flex-col items-center gap-3">
        <div className="flex w-full items-center justify-center gap-3">
          {isRunning ? (
            <Button
              size="lg"
              variant="secondary"
              className="h-16 flex-1 text-lg"
              onClick={() => pause()}
              disabled={isPending}
            >
              <Pause className="h-6 w-6" /> Duraklat
            </Button>
          ) : (
            <Button
              size="lg"
              className="h-16 flex-1 text-lg"
              onClick={() => resume()}
              disabled={isPending}
            >
              <Play className="h-6 w-6" /> Devam et
            </Button>
          )}
          <Button
            size="lg"
            variant="destructive"
            className="h-16 flex-1 text-lg"
            onClick={() => stop()}
            disabled={isPending}
          >
            <Square className="h-6 w-6" /> Bitir
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Odak modu yalnızca "Bitir" ile kapanır. Süre kaydedilir; görevin
          toplam süresi korunur.
        </p>
      </div>
    </div>
  );
}

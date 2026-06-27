import { Pause, Play, Square, Timer as TimerIcon, ListTodo } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatDuration } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { useTasks } from "@/features/tasks/api";
import { useTimer, liveElapsedSeconds } from "./timer-provider";
import { BlockChips } from "./block-chips";

export function TimerPage() {
  const { t } = useI18n();
  const {
    activeTimer,
    activeTaskId,
    isRunning,
    liveElapsed,
    isPending,
    start,
    pause,
    resume,
    stop,
  } = useTimer();
  const { data: tasks } = useTasks();

  const activeTask = tasks?.find((t) => t.id === activeTaskId);
  const sessionElapsed = activeTimer
    ? Math.round(liveElapsedSeconds(activeTimer, Date.now()))
    : 0;
  const totalSeconds = (activeTask?.total_seconds ?? 0) + liveElapsed;
  const openTasks = (tasks ?? []).filter((t) => t.status !== "done");

  return (
    <div>
      <PageHeader title={t("timer.title")} description={t("timer.desc")} />

      {activeTaskId ? (
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-8 py-6">
          {/* Görev adı */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t("timer.nowOn")}</p>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">
              {activeTask?.title ?? t("focus.task")}
            </h2>
          </div>

          {/* Büyük zaman göstergesi */}
          <div
            className={cn(
              "relative flex aspect-square w-72 max-w-[80vw] items-center justify-center rounded-full border-4 transition-colors md:w-96",
              isRunning
                ? "animate-pulse-ring border-primary bg-primary/5"
                : "border-muted bg-muted/30",
            )}
          >
            <div className="text-center">
              <p className="font-mono text-5xl font-bold tabular-nums md:text-7xl">
                {formatDuration(totalSeconds, true)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {isRunning ? t("focus.running") : t("focus.pausedShort")} ·{" "}
                {t("timer.thisSession", {
                  s: formatDuration(sessionElapsed, true),
                })}
              </p>
            </div>
          </div>

          {/* Kontroller */}
          <div className="flex items-center gap-3">
            {isRunning ? (
              <Button
                size="lg"
                variant="secondary"
                className="h-14 w-40 text-base"
                onClick={() => pause()}
                disabled={isPending}
              >
                <Pause className="h-5 w-5" /> {t("focus.pause")}
              </Button>
            ) : (
              <Button
                size="lg"
                className="h-14 w-40 text-base"
                onClick={() => resume()}
                disabled={isPending}
              >
                <Play className="h-5 w-5" /> {t("focus.resume")}
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-40 text-base text-destructive hover:text-destructive"
              onClick={() => stop()}
              disabled={isPending}
            >
              <Square className="h-5 w-5" /> {t("focus.stop")}
            </Button>
          </div>
          <p className="max-w-sm text-center text-xs text-muted-foreground">
            {t("timer.pageHint")}
          </p>
        </div>
      ) : openTasks.length === 0 ? (
        <EmptyState
          icon={TimerIcon}
          title={t("timer.emptyTitle")}
          description={t("timer.emptyDesc")}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card/40 p-4">
            <p className="mb-3 text-sm font-medium">{t("timer.mode")}</p>
            <BlockChips className="justify-start" />
            <p className="mt-3 text-xs text-muted-foreground">
              <strong>{t("timer.modeFreeLabel")}</strong>
              {t("timer.modeFreeDesc")}
              <strong>{t("timer.modeBlockLabel")}</strong>
              {t("timer.modeBlockDesc")}
              <em>{t("timer.modeLocked")}</em>
              {t("timer.modeLockedDesc")}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{t("timer.pickTask")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {openTasks.map((task) => (
              <Card
                key={task.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{task.title}</p>
                  {task.total_seconds > 0 && (
                    <p className="font-mono text-xs text-muted-foreground">
                      {t("timer.total", {
                        s: formatDuration(task.total_seconds, true),
                      })}
                    </p>
                  )}
                </div>
                <Button
                  size="icon"
                  onClick={() => start(task.id)}
                  disabled={isPending}
                  aria-label={t("taskCard.startTimer")}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ListTodo className="h-3.5 w-3.5" /> {t("timer.manageHint")}
          </p>
        </div>
      )}
    </div>
  );
}

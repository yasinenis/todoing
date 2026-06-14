import { useEffect } from "react";
import { Pause, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import { playChime } from "@/lib/sound";
import { useTasks } from "@/features/tasks/api";
import { useTimer, liveElapsedSeconds } from "./timer-provider";
import { BlockChips } from "./block-chips";

const RING_R = 46;
const RING_C = 2 * Math.PI * RING_R;

/**
 * Tam ekran odak modu. Sayaç aktifken sekmeyi tamamen (opak) kaplar.
 * Odak bloğu seçiliyse hedefe doğru geri sayım + ilerleme halkası gösterir,
 * dolunca ses + bildirim verir. Yalnızca "Bitir" ile kapanır.
 */
export function TimerFocus() {
  const {
    activeTimer,
    activeTaskId,
    isRunning,
    liveElapsed,
    isPending,
    blockSeconds,
    pause,
    resume,
    stop,
  } = useTimer();
  const { data: tasks } = useTasks();

  const task = tasks?.find((t) => t.id === activeTaskId);
  const session = activeTimer
    ? Math.round(liveElapsedSeconds(activeTimer, Date.now()))
    : 0;
  const totalSeconds = (task?.total_seconds ?? 0) + liveElapsed;

  const hasBlock = blockSeconds != null;
  const blockMin = blockSeconds != null ? Math.round(blockSeconds / 60) : 0;
  const remaining =
    blockSeconds != null ? Math.max(0, blockSeconds - session) : 0;
  const frac =
    blockSeconds != null && blockSeconds > 0
      ? Math.min(1, session / blockSeconds)
      : 0;
  const completed = blockSeconds != null && session >= blockSeconds;

  // Blok dolunca bir kez: ses + toast + (izin varsa) bildirim.
  useEffect(() => {
    if (!completed) return;
    playChime();
    toast.success("Blok tamamlandı 🎉", {
      description: `${Math.round((blockSeconds ?? 0) / 60)} dakikalık odak süresi doldu.`,
    });
    if (
      "Notification" in window &&
      Notification.permission === "granted" &&
      document.visibilityState !== "visible"
    ) {
      try {
        new Notification("Blok tamamlandı 🎉", {
          body: task?.title ?? "Odak süresi doldu",
        });
      } catch {
        /* yok say */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  if (!activeTaskId) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex animate-fade-in items-center justify-center overflow-y-auto bg-background px-6 py-10 safe-top safe-bottom"
      role="dialog"
      aria-modal="true"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/20"
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Odak modu
          </p>
          <h2 className="mt-2 text-2xl font-bold md:text-4xl">
            {task?.title ?? "Görev"}
          </h2>
        </div>

        {/* Blok süresi seçimi */}
        <BlockChips />

        {/* Büyük dairesel sayaç (+ blok ilerleme halkası) */}
        <div
          className={cn(
            "relative flex aspect-square w-72 max-w-[80vw] items-center justify-center rounded-full md:w-[26rem]",
            hasBlock
              ? "bg-card/40"
              : cn(
                  "border-4",
                  isRunning
                    ? "animate-pulse-ring border-primary bg-primary/5"
                    : "border-muted bg-muted/30",
                ),
          )}
        >
          {hasBlock && (
            <svg
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
            >
              <circle
                cx="50"
                cy="50"
                r={RING_R}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r={RING_R}
                fill="none"
                stroke={
                  completed ? "hsl(var(--success))" : "hsl(var(--primary))"
                }
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - frac)}
                style={{ transition: "stroke-dashoffset 0.5s linear" }}
              />
            </svg>
          )}
          <div className="relative z-10 px-6 text-center">
            {hasBlock ? (
              completed ? (
                <>
                  <p className="text-3xl font-bold md:text-5xl">
                    Tamamlandı 🎉
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {blockMin} dk hedef doldu · geçen{" "}
                    {formatDuration(session, true)}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-6xl font-bold tabular-nums md:text-8xl">
                    {formatDuration(remaining, true)}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    kalan · hedef {blockMin} dk{" "}
                    {!isRunning && "· duraklatıldı"}
                  </p>
                </>
              )
            ) : (
              <>
                <p className="font-mono text-6xl font-bold tabular-nums md:text-8xl">
                  {formatDuration(totalSeconds, true)}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {isRunning ? "Çalışıyor" : "Duraklatıldı"} · bu oturum{" "}
                  {formatDuration(session, true)}
                </p>
              </>
            )}
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
    </div>
  );
}

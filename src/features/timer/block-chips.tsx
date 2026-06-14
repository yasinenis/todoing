import { cn } from "@/lib/utils";
import { useTimer } from "./timer-provider";

/** Hazır odak bloğu süreleri (dakika). */
export const BLOCK_PRESETS = [30, 60, 90, 120, 180];

/** Odak bloğu seçimi (30/60/90/120/180 dk). Seçili olana tekrar basınca kapanır. */
export function BlockChips({ className }: { className?: string }) {
  const { blockSeconds, setBlock } = useTimer();

  const choose = (minutes: number) => {
    const sec = minutes * 60;
    const next = blockSeconds === sec ? null : sec;
    setBlock(next);
    // Blok dolunca bildirim gösterebilmek için izin iste (sessizce).
    if (
      next &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      void Notification.requestPermission();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2",
        className,
      )}
    >
      {BLOCK_PRESETS.map((m) => {
        const active = blockSeconds === m * 60;
        return (
          <button
            key={m}
            type="button"
            onClick={() => choose(m)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "hover:bg-accent",
            )}
          >
            {m} dk
          </button>
        );
      })}
      {blockSeconds != null && (
        <button
          type="button"
          onClick={() => setBlock(null)}
          className="rounded-full border px-3.5 py-1.5 text-sm text-muted-foreground hover:bg-accent"
        >
          Serbest
        </button>
      )}
    </div>
  );
}

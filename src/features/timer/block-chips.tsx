import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { useTimer } from "./timer-provider";

/** Hazır odak bloğu süreleri (dakika). */
export const BLOCK_PRESETS = [30, 60, 90, 120, 180];

const chip = (active: boolean) =>
  cn(
    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
    active ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent",
  );

function requestNotif() {
  if ("Notification" in window && Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

/**
 * Sayaç modu seçimi (başlatmadan önce). "Serbest" → ileri sayar;
 * bir süre seçersen geri sayar (blok). "Özel" → kendi dakikan.
 */
export function BlockChips({ className }: { className?: string }) {
  const { t } = useI18n();
  const { blockSeconds, setBlock } = useTimer();
  const isPreset =
    blockSeconds != null && BLOCK_PRESETS.includes(blockSeconds / 60);
  const customActive = blockSeconds != null && !isPreset;

  const [showCustom, setShowCustom] = useState(customActive);
  const [customVal, setCustomVal] = useState(
    customActive ? String(Math.round(blockSeconds! / 60)) : "",
  );

  const choosePreset = (m: number) => {
    setShowCustom(false);
    setBlock(blockSeconds === m * 60 ? null : m * 60);
    requestNotif();
  };

  const applyCustom = () => {
    const n = Math.round(Number(customVal));
    if (n > 0) {
      setBlock(n * 60);
      requestNotif();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => {
          setShowCustom(false);
          setBlock(null);
        }}
        className={chip(blockSeconds == null)}
      >
        {t("timer.modeFree")}
      </button>

      {BLOCK_PRESETS.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => choosePreset(m)}
          className={chip(blockSeconds === m * 60)}
        >
          {m} {t("timer.minSuffix")}
        </button>
      ))}

      <button
        type="button"
        onClick={() => setShowCustom((s) => !s)}
        className={chip(customActive)}
      >
        {t("timer.modeCustom")}
      </button>

      {showCustom && (
        <span className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            value={customVal}
            onChange={(e) => setCustomVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyCustom();
              }
            }}
            placeholder={t("timer.minPlaceholder")}
            className="h-9 w-20"
          />
          <Button type="button" size="sm" onClick={applyCustom}>
            {t("timer.set")}
          </Button>
        </span>
      )}
    </div>
  );
}

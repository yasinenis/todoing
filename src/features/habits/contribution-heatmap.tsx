import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { enUS, tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toDayStr } from "@/lib/date";
import { hexToRgba } from "@/lib/colors";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { intensityLevel, LEVEL_OPACITY } from "./habit-stats";

interface Props {
  color: string;
  /** gün ("yyyy-MM-dd") → count */
  logs: Map<string, number>;
  target: number;
}

/**
 * Aylık alışkanlık ısı haritası. İçinde bulunulan ay öntanımlı; oklarla
 * geçmiş aylara bakılır. Gelecek aya geçilemez.
 */
export function ContributionHeatmap({ color, logs, target }: Props) {
  const { t, lang } = useI18n();
  const locale = lang === "en" ? enUS : tr;
  const weekdays = [0, 1, 2, 3, 4, 5, 6].map((i) => t(`heatmap.wd${i}`));
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const todayStart = startOfDay(new Date());
  const atCurrentMonth = isSameMonth(month, new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  return (
    <div>
      {/* Ay gezinme */}
      <div className="mb-2 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label={t("heatmap.prevMonth")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium capitalize">
          {format(month, "LLLL yyyy", { locale })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          disabled={atCurrentMonth}
          aria-label={t("heatmap.nextMonth")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Gün başlıkları */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekdays.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Günler */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          if (!inMonth) return <div key={day.toISOString()} />;
          const future = isAfter(startOfDay(day), todayStart);
          const count = logs.get(toDayStr(day)) ?? 0;
          const level = intensityLevel(count, target);
          const bg =
            future || level === 0
              ? "hsl(var(--muted))"
              : hexToRgba(color, LEVEL_OPACITY[level]);
          return (
            <div
              key={day.toISOString()}
              title={`${format(day, "d MMM yyyy", { locale })}: ${count}`}
              className="flex aspect-square items-center justify-center rounded-md text-[11px]"
              style={{
                backgroundColor: bg,
                opacity: future ? 0.4 : 1,
                color:
                  level >= 3
                    ? "#fff"
                    : "hsl(var(--muted-foreground))",
              }}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>

      {/* Açıklama */}
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>{t("heatmap.less")}</span>
        {LEVEL_OPACITY.map((op, i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-sm"
            style={{
              backgroundColor:
                i === 0 ? "hsl(var(--muted))" : hexToRgba(color, op),
            }}
          />
        ))}
        <span>{t("heatmap.more")}</span>
      </div>
    </div>
  );
}

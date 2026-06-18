import { useEffect, useMemo, useRef } from "react";
import { format, isAfter, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { toDayStr } from "@/lib/date";
import { hexToRgba } from "@/lib/colors";
import { buildWeeks, intensityLevel, LEVEL_OPACITY } from "./habit-stats";

interface Props {
  color: string;
  /** gün ("yyyy-MM-dd") → count */
  logs: Map<string, number>;
  target: number;
  weeks?: number;
}

const CELL = 13;
const GAP = 3;
const GUTTER = 24;
const WEEKDAY_LABELS = ["Pzt", "", "Çar", "", "Cum", "", ""];

export function ContributionHeatmap({
  color,
  logs,
  target,
  weeks = 53,
}: Props) {
  const cols = useMemo(() => buildWeeks(weeks), [weeks]);
  const todayStart = startOfDay(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Açılışta en sağa kaydır (bugün/son haftalar görünsün).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [cols]);

  return (
    <div ref={scrollRef} className="overflow-x-auto pb-1">
      <div className="inline-flex flex-col gap-1">
        {/* Ay etiketleri */}
        <div
          className="flex text-[10px] text-muted-foreground"
          style={{ gap: GAP, marginLeft: GUTTER }}
        >
          {cols.map((col, i) => {
            const first = col[0];
            const prev = cols[i - 1]?.[0];
            const showMonth =
              i === 0 || (prev && prev.getMonth() !== first.getMonth());
            return (
              <div
                key={i}
                style={{ width: CELL }}
                className="overflow-visible whitespace-nowrap"
              >
                {showMonth ? format(first, "LLL", { locale: tr }) : ""}
              </div>
            );
          })}
        </div>

        <div className="flex" style={{ gap: GAP }}>
          {/* Gün etiketleri */}
          <div
            className="flex flex-col text-[10px] text-muted-foreground"
            style={{ gap: GAP, width: GUTTER }}
          >
            {WEEKDAY_LABELS.map((d, i) => (
              <div key={i} style={{ height: CELL, lineHeight: `${CELL}px` }}>
                {d}
              </div>
            ))}
          </div>

          {/* Hafta sütunları */}
          {cols.map((col, ci) => (
            <div key={ci} className="flex flex-col" style={{ gap: GAP }}>
              {col.map((day) => {
                const key = toDayStr(day);
                const isFuture = isAfter(startOfDay(day), todayStart);
                const count = logs.get(key) ?? 0;
                const level = intensityLevel(count, target);
                const bg = isFuture
                  ? "transparent"
                  : level === 0
                    ? "hsl(var(--muted))"
                    : hexToRgba(color, LEVEL_OPACITY[level]);
                return (
                  <div
                    key={key}
                    title={
                      isFuture
                        ? ""
                        : `${format(day, "d MMM yyyy", { locale: tr })}: ${count}`
                    }
                    style={{
                      width: CELL,
                      height: CELL,
                      backgroundColor: bg,
                      borderRadius: 3,
                      opacity: isFuture ? 0.3 : 1,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Açıklama */}
        <div className="mt-1 flex items-center gap-1 self-end text-[10px] text-muted-foreground">
          <span>az</span>
          {LEVEL_OPACITY.map((op, i) => (
            <div
              key={i}
              style={{
                width: CELL,
                height: CELL,
                borderRadius: 3,
                backgroundColor:
                  i === 0 ? "hsl(var(--muted))" : hexToRgba(color, op),
              }}
            />
          ))}
          <span>çok</span>
        </div>
      </div>
    </div>
  );
}

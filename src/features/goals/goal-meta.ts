import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import { toDayStr } from "@/lib/date";
import type { GoalTimeframe } from "@/lib/database.types";

export const TIMEFRAME_LABELS: Record<GoalTimeframe, string> = {
  daily: "Günlük",
  weekly: "Haftalık",
  monthly: "Aylık",
  quarterly: "3 Aylık",
  yearly: "Yıllık",
};

/** Hedefler sayfasında gösterim sırası. */
export const TIMEFRAME_ORDER: GoalTimeframe[] = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
];

/** Panelde öne çıkacak uzun vadeli zaman dilimleri. */
export const LONG_TERM: GoalTimeframe[] = ["quarterly", "yearly"];

/**
 * Zaman dilimine göre hedef tarihini hesaplar.
 * daily için gün sayısı (1-7) kullanılır; diğerleri sabit.
 */
export function computeTargetDate(
  timeframe: GoalTimeframe,
  start: Date,
  dailyDays = 1,
): string {
  switch (timeframe) {
    case "daily":
      return toDayStr(addDays(start, Math.min(7, Math.max(1, dailyDays))));
    case "weekly":
      return toDayStr(addWeeks(start, 1));
    case "monthly":
      return toDayStr(addMonths(start, 1));
    case "quarterly":
      return toDayStr(addMonths(start, 3));
    case "yearly":
      return toDayStr(addYears(start, 1));
  }
}

import { addDays, addMonths, addYears } from "date-fns";
import { toDayStr } from "@/lib/date";
import type { PlanPeriod } from "@/lib/database.types";

/** Dönem etiketleri i18n anahtarı olarak; render'da t() ile çözülür. */
export const PERIOD_LABEL_KEYS: Record<PlanPeriod, string> = {
  "1d": "period.1d",
  "3d": "period.3d",
  "1w": "period.1w",
  "1m": "period.1m",
  "1y": "period.1y",
};

export const PERIOD_ORDER: PlanPeriod[] = ["1d", "3d", "1w", "1m", "1y"];

/** Döneme göre kapsayıcı (inclusive) bitiş tarihini hesaplar. */
export function computeEndDate(period: PlanPeriod, start: Date): string {
  switch (period) {
    case "1d":
      return toDayStr(start);
    case "3d":
      return toDayStr(addDays(start, 2));
    case "1w":
      return toDayStr(addDays(start, 6));
    case "1m":
      return toDayStr(addDays(addMonths(start, 1), -1));
    case "1y":
      return toDayStr(addDays(addYears(start, 1), -1));
  }
}

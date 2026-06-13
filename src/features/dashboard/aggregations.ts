import {
  format,
  getYear,
  parseISO,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";
import { tr } from "date-fns/locale";
import { toDayStr } from "@/lib/date";
import type { TimeEntry } from "@/lib/database.types";

export interface Bucket {
  label: string;
  hours: number;
  seconds: number;
}

const toHours = (seconds: number) => Math.round((seconds / 3600) * 100) / 100;

/** gün ("yyyy-MM-dd") → toplam saniye */
function secondsByDay(entries: TimeEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of entries) {
    map.set(e.day, (map.get(e.day) ?? 0) + e.duration_seconds);
  }
  return map;
}

/** Son `days` gün — günlük toplam. */
export function dailyBuckets(entries: TimeEntry[], days = 14): Bucket[] {
  const byDay = secondsByDay(entries);
  const out: Bucket[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const key = toDayStr(d);
    const seconds = byDay.get(key) ?? 0;
    out.push({ label: format(d, "d MMM", { locale: tr }), hours: toHours(seconds), seconds });
  }
  return out;
}

/** Son `weeks` hafta — haftalık toplam (Pazartesi başlangıçlı). */
export function weeklyBuckets(entries: TimeEntry[], weeks = 12): Bucket[] {
  const byWeek = new Map<string, number>();
  for (const e of entries) {
    const wk = toDayStr(startOfWeek(parseISO(e.day), { weekStartsOn: 1 }));
    byWeek.set(wk, (byWeek.get(wk) ?? 0) + e.duration_seconds);
  }
  const out: Bucket[] = [];
  const thisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  for (let i = weeks - 1; i >= 0; i--) {
    const wkStart = subWeeks(thisWeek, i);
    const key = toDayStr(wkStart);
    const seconds = byWeek.get(key) ?? 0;
    out.push({
      label: format(wkStart, "d MMM", { locale: tr }),
      hours: toHours(seconds),
      seconds,
    });
  }
  return out;
}

/** İçinde bulunulan yılın ayları — aylık toplam. */
export function monthlyThisYear(entries: TimeEntry[]): Bucket[] {
  const year = getYear(new Date());
  const months = new Array(12).fill(0);
  for (const e of entries) {
    const d = parseISO(e.day);
    if (getYear(d) === year) months[d.getMonth()] += e.duration_seconds;
  }
  return months.map((seconds, m) => ({
    label: format(new Date(year, m, 1), "LLL", { locale: tr }),
    hours: toHours(seconds),
    seconds,
  }));
}

/** Tüm yıllar — yıllık toplam. */
export function yearlyBuckets(entries: TimeEntry[]): Bucket[] {
  const byYear = new Map<number, number>();
  for (const e of entries) {
    const y = getYear(parseISO(e.day));
    byYear.set(y, (byYear.get(y) ?? 0) + e.duration_seconds);
  }
  if (byYear.size === 0) {
    const y = getYear(new Date());
    return [{ label: String(y), hours: 0, seconds: 0 }];
  }
  return [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([y, seconds]) => ({ label: String(y), hours: toHours(seconds), seconds }));
}

/** Bugünün toplam çalışma saniyesi. */
export function todaySeconds(entries: TimeEntry[]): number {
  const key = toDayStr(new Date());
  return entries
    .filter((e) => e.day === key)
    .reduce((sum, e) => sum + e.duration_seconds, 0);
}

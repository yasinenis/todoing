import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

/** Date → "yyyy-MM-dd" (DB `date` kolonları için). */
export function toDayStr(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/** "yyyy-MM-dd" → Date (yerel). */
export function fromDayStr(day: string): Date {
  return parseISO(day);
}

/** Türkçe okunur tarih, ör. "13 Haziran 2026". */
export function formatLong(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMMM yyyy", { locale: tr });
}

/** Kısa tarih, ör. "13 Haz". */
export function formatShort(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMM", { locale: tr });
}

/** Bugünün gün dizesi. */
export function today(): string {
  return toDayStr(new Date());
}

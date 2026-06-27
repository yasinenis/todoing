import { format, parseISO } from "date-fns";
import { enUS, tr, type Locale } from "date-fns/locale";

/** Aktif tarih yereli. I18nProvider dil değişince `setDateLocale` ile günceller. */
let activeLocale: Locale =
  (typeof localStorage !== "undefined" &&
    localStorage.getItem("todoing-lang")) === "en"
    ? enUS
    : tr;

export function setDateLocale(locale: Locale): void {
  activeLocale = locale;
}

/** Date → "yyyy-MM-dd" (DB `date` kolonları için). */
export function toDayStr(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/** "yyyy-MM-dd" → Date (yerel). */
export function fromDayStr(day: string): Date {
  return parseISO(day);
}

/** Okunur uzun tarih, ör. "13 Haziran 2026" / "June 13th, 2026". */
export function formatLong(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "PPP", { locale: activeLocale });
}

/** Kısa tarih, ör. "13 Haz" / "Jun 13". */
export function formatShort(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMM", { locale: activeLocale });
}

/** Bugünün gün dizesi. */
export function today(): string {
  return toDayStr(new Date());
}

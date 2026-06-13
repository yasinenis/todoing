import { addDays, differenceInCalendarDays, subDays } from "date-fns";
import { toDayStr } from "@/lib/date";

/** count/target oranına göre 0-4 yoğunluk seviyesi (heatmap tonlaması). */
export function intensityLevel(count: number, target: number): number {
  if (count <= 0) return 0;
  const t = Math.max(1, target);
  const ratio = count / t;
  if (ratio >= 1) return 4;
  if (ratio >= 0.66) return 3;
  if (ratio >= 0.33) return 2;
  return 1;
}

/** Her seviye için opaklık (0 = boş hücre, ayrı stillenir). */
export const LEVEL_OPACITY = [0, 0.28, 0.5, 0.74, 1] as const;

/** Bir günün "tamamlanmış" sayılması: count >= target. */
function isComplete(count: number | undefined, target: number): boolean {
  return (count ?? 0) >= Math.max(1, target);
}

export interface StreakStats {
  current: number;
  best: number;
}

/**
 * Mevcut ve en iyi seriyi hesaplar. logs: gün → count. target: günlük hedef.
 * Mevcut seri bugünden (bugün tamamlanmadıysa dünden) geriye doğru sayılır.
 */
export function computeStreaks(
  logs: Map<string, number>,
  target: number,
): StreakStats {
  const today = new Date();

  // Mevcut seri
  let current = 0;
  let cursor = today;
  if (!isComplete(logs.get(toDayStr(today)), target)) {
    cursor = subDays(today, 1);
  }
  while (isComplete(logs.get(toDayStr(cursor)), target)) {
    current += 1;
    cursor = subDays(cursor, 1);
  }

  // En iyi seri (kayıtlı günler üzerinde)
  const completedDays = [...logs.entries()]
    .filter(([, c]) => c >= Math.max(1, target))
    .map(([d]) => d)
    .sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of completedDays) {
    if (prev && differenceInCalendarDays(new Date(day), new Date(prev)) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = day;
  }

  return { current, best: Math.max(best, current) };
}

/** Son `days` gün içindeki tamamlanma oranı (%). */
export function completionRate(
  logs: Map<string, number>,
  target: number,
  days = 30,
): number {
  const today = new Date();
  let completed = 0;
  for (let i = 0; i < days; i++) {
    const d = toDayStr(subDays(today, i));
    if (isComplete(logs.get(d), target)) completed += 1;
  }
  return Math.round((completed / days) * 100);
}

/** Heatmap için hafta sütunlarını üretir (Pazartesi başlangıçlı, son `weeks` hafta). */
export function buildWeeks(weeks: number): Date[][] {
  const today = new Date();
  // Bu haftanın Pazartesi'sini bul
  const dow = (today.getDay() + 6) % 7; // 0 = Pazartesi
  const thisMonday = subDays(today, dow);
  const startMonday = subDays(thisMonday, (weeks - 1) * 7);

  const cols: Date[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: Date[] = [];
    for (let d = 0; d < 7; d++) {
      col.push(addDays(startMonday, w * 7 + d));
    }
    cols.push(col);
  }
  return cols;
}

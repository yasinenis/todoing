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

export type WorkRange = "daily" | "weekly" | "yearly" | "all";

/** Bir zaman kaydının ait olduğu kategori (renk + ad + anahtar). */
export interface CatResolved {
  key: string;
  name: string;
  color: string;
}
export type CatResolver = (taskId: string | null) => CatResolved;

export interface WorkSeries {
  key: string;
  name: string;
  color: string;
}
export interface WorkChart {
  /** Recharts satırları: { label, [catKey]: saat } */
  rows: Array<Record<string, string | number>>;
  /** Grafikte görünen kategoriler (yığın sırası). */
  series: WorkSeries[];
}

const toHours = (seconds: number) => Math.round((seconds / 3600) * 100) / 100;

interface BucketDef {
  key: string;
  label: string;
}

/** Seçilen aralık için kova tanımları + bir kaydı kovaya eşleyen fonksiyon. */
function bucketsFor(
  range: WorkRange,
  entries: TimeEntry[],
): { defs: BucketDef[]; keyOf: (e: TimeEntry) => string | null } {
  const today = new Date();

  if (range === "daily") {
    const defs: BucketDef[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      defs.push({ key: toDayStr(d), label: format(d, "d MMM", { locale: tr }) });
    }
    return { defs, keyOf: (e) => e.day };
  }

  if (range === "weekly") {
    const defs: BucketDef[] = [];
    const thisWeek = startOfWeek(today, { weekStartsOn: 1 });
    for (let i = 11; i >= 0; i--) {
      const w = subWeeks(thisWeek, i);
      defs.push({ key: toDayStr(w), label: format(w, "d MMM", { locale: tr }) });
    }
    return {
      defs,
      keyOf: (e) =>
        toDayStr(startOfWeek(parseISO(e.day), { weekStartsOn: 1 })),
    };
  }

  if (range === "yearly") {
    const year = getYear(today);
    const defs: BucketDef[] = [];
    for (let m = 0; m < 12; m++) {
      defs.push({
        key: `${m}`,
        label: format(new Date(year, m, 1), "LLL", { locale: tr }),
      });
    }
    return {
      defs,
      keyOf: (e) => {
        const d = parseISO(e.day);
        return getYear(d) === year ? `${d.getMonth()}` : null;
      },
    };
  }

  // all — tüm yıllar
  const years = new Set<number>();
  for (const e of entries) years.add(getYear(parseISO(e.day)));
  if (years.size === 0) years.add(getYear(today));
  const sorted = [...years].sort((a, b) => a - b);
  return {
    defs: sorted.map((y) => ({ key: `${y}`, label: `${y}` })),
    keyOf: (e) => `${getYear(parseISO(e.day))}`,
  };
}

/**
 * Çalışma saatlerini seçilen aralıkta KATEGORİ kırılımıyla toplar.
 * Her satır kategori başına saat içerir → yığılmış (stacked) bar için.
 */
export function buildWorkHours(
  entries: TimeEntry[],
  range: WorkRange,
  resolve: CatResolver,
): WorkChart {
  const { defs, keyOf } = bucketsFor(range, entries);
  const bucketKeys = new Set(defs.map((d) => d.key));

  const acc = new Map<string, Map<string, number>>(); // bucket → cat → sn
  const catTotals = new Map<string, number>();
  const catInfo = new Map<string, CatResolved>();

  for (const e of entries) {
    const bk = keyOf(e);
    if (bk == null || !bucketKeys.has(bk)) continue;
    const cat = resolve(e.task_id);
    catInfo.set(cat.key, cat);
    catTotals.set(cat.key, (catTotals.get(cat.key) ?? 0) + e.duration_seconds);
    let inner = acc.get(bk);
    if (!inner) {
      inner = new Map();
      acc.set(bk, inner);
    }
    inner.set(cat.key, (inner.get(cat.key) ?? 0) + e.duration_seconds);
  }

  // Kategoriler toplam süreye göre sıralı (en çok çalışılan altta).
  const series: WorkSeries[] = [...catTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => catInfo.get(key)!);

  const rows = defs.map(({ key, label }) => {
    const row: Record<string, string | number> = { label };
    const inner = acc.get(key);
    for (const s of series) row[s.key] = toHours(inner?.get(s.key) ?? 0);
    return row;
  });

  return { rows, series };
}

/** Bugünün toplam çalışma saniyesi. */
export function todaySeconds(entries: TimeEntry[]): number {
  const key = toDayStr(new Date());
  return entries
    .filter((e) => e.day === key)
    .reduce((sum, e) => sum + e.duration_seconds, 0);
}

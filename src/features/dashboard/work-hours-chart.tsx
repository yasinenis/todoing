import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category, Task, TimeEntry } from "@/lib/database.types";
import { useI18n } from "@/i18n";
import { ChartCard } from "./chart-card";
import { buildWorkHours, type CatResolver, type WorkRange } from "./aggregations";

const AXIS_COLOR = "#94a3b8";
const UNCATEGORIZED_COLOR = "#a78bfa"; // kategori yoksa mor
const FOCUS_COLOR = "#f59e0b"; // odak puanı çizgisi (amber)

interface TooltipItem {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
}) {
  const { t } = useI18n();
  if (!active || !payload?.length) return null;
  // Saat kalemleri (kategoriler) ile odak puanını ayır.
  const hourItems = payload.filter(
    (p) => p.dataKey !== "focus" && (p.value ?? 0) > 0,
  );
  const focusItem = payload.find((p) => p.dataKey === "focus");
  const focusVal = focusItem?.value;
  if (hourItems.length === 0 && focusVal == null) return null;
  const total = hourItems.reduce((s, p) => s + (p.value ?? 0), 0);
  const h = t("chart.hoursAbbr");
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {hourItems.map((p) => (
        <p
          key={p.name}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          {p.name}: {p.value} {h}
        </p>
      ))}
      {hourItems.length > 0 && (
        <p className="mt-1 border-t pt-1 font-medium">
          {t("chart.total")}: {Math.round(total * 100) / 100} {h}
        </p>
      )}
      {focusVal != null && (
        <p
          className="mt-1 flex items-center gap-1.5 font-medium"
          style={{ color: FOCUS_COLOR }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: FOCUS_COLOR }}
          />
          {t("chart.focus")}: {focusVal}/10
        </p>
      )}
    </div>
  );
}

export function WorkHoursChart({
  entries,
  tasks,
  categories,
}: {
  entries: TimeEntry[];
  tasks: Task[];
  categories: Category[];
}) {
  const { t } = useI18n();
  const [range, setRange] = useState<WorkRange>("daily");
  const uncategorized = t("chart.uncategorized");

  const resolve = useMemo<CatResolver>(() => {
    const taskCat = new Map(tasks.map((t) => [t.id, t.category_id]));
    const catInfo = new Map(categories.map((c) => [c.id, c]));
    return (taskId) => {
      const catId = taskId ? (taskCat.get(taskId) ?? null) : null;
      if (catId) {
        const c = catInfo.get(catId);
        if (c) return { key: c.id, name: c.name, color: c.color };
      }
      return { key: "none", name: uncategorized, color: UNCATEGORIZED_COLOR };
    };
  }, [tasks, categories, uncategorized]);

  const { rows, series, hasFocus } = useMemo(
    () => buildWorkHours(entries, range, resolve),
    [entries, range, resolve],
  );

  return (
    <ChartCard
      title={t("chart.workHours")}
      action={
        <Tabs value={range} onValueChange={(v) => setRange(v as WorkRange)}>
          <TabsList className="h-8">
            <TabsTrigger value="daily" className="px-2 text-xs">
              {t("chart.daily")}
            </TabsTrigger>
            <TabsTrigger value="weekly" className="px-2 text-xs">
              {t("chart.weekly")}
            </TabsTrigger>
            <TabsTrigger value="yearly" className="px-2 text-xs">
              {t("chart.yearly")}
            </TabsTrigger>
            <TabsTrigger value="all" className="px-2 text-xs">
              {t("chart.all")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={rows}
          margin={{ top: 8, right: hasFocus ? 4 : 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeOpacity={0.15} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: AXIS_COLOR }}
            tickLine={false}
            axisLine={false}
            interval="preserveEnd"
          />
          <YAxis
            yAxisId="hours"
            tick={{ fontSize: 11, fill: AXIS_COLOR }}
            tickLine={false}
            axisLine={false}
            width={36}
            allowDecimals={false}
          />
          {/* Sağ eksen: odak puanı 0-10 (yalnızca puan varsa) */}
          <YAxis
            yAxisId="focus"
            orientation="right"
            domain={[0, 10]}
            ticks={[0, 5, 10]}
            width={24}
            hide={!hasFocus}
            tick={{ fontSize: 11, fill: FOCUS_COLOR }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "currentColor", opacity: 0.06 }}
          />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              yAxisId="hours"
              dataKey={s.key}
              name={s.name}
              stackId="work"
              fill={s.color}
              radius={
                i === series.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]
              }
              maxBarSize={42}
            />
          ))}
          {hasFocus && (
            <Line
              yAxisId="focus"
              type="monotone"
              dataKey="focus"
              name={t("chart.focus")}
              stroke={FOCUS_COLOR}
              strokeWidth={2}
              dot={{ r: 3, fill: FOCUS_COLOR }}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Açıklama: kategoriler + odak puanı */}
      {(series.length > 0 || hasFocus) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {series.map((s) => (
            <span
              key={s.key}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.name}
            </span>
          ))}
          {hasFocus && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: FOCUS_COLOR }}
              />
              {t("chart.focus")} (0-10)
            </span>
          )}
        </div>
      )}
    </ChartCard>
  );
}

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category, Task, TimeEntry } from "@/lib/database.types";
import { ChartCard } from "./chart-card";
import { buildWorkHours, type CatResolver, type WorkRange } from "./aggregations";

const AXIS_COLOR = "#94a3b8";
const UNCATEGORIZED_COLOR = "#a78bfa"; // kategori yoksa mor

interface TooltipItem {
  name?: string;
  value?: number;
  color?: string;
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
  if (!active || !payload?.length) return null;
  const items = payload.filter((p) => (p.value ?? 0) > 0);
  if (items.length === 0) return null;
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {items.map((p) => (
        <p
          key={p.name}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          {p.name}: {p.value} sa
        </p>
      ))}
      <p className="mt-1 border-t pt-1 font-medium">
        Toplam: {Math.round(total * 100) / 100} sa
      </p>
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
  const [range, setRange] = useState<WorkRange>("daily");

  const resolve = useMemo<CatResolver>(() => {
    const taskCat = new Map(tasks.map((t) => [t.id, t.category_id]));
    const catInfo = new Map(categories.map((c) => [c.id, c]));
    return (taskId) => {
      const catId = taskId ? (taskCat.get(taskId) ?? null) : null;
      if (catId) {
        const c = catInfo.get(catId);
        if (c) return { key: c.id, name: c.name, color: c.color };
      }
      return { key: "none", name: "Kategorisiz", color: UNCATEGORIZED_COLOR };
    };
  }, [tasks, categories]);

  const { rows, series } = useMemo(
    () => buildWorkHours(entries, range, resolve),
    [entries, range, resolve],
  );

  return (
    <ChartCard
      title="Çalışma saatleri"
      action={
        <Tabs value={range} onValueChange={(v) => setRange(v as WorkRange)}>
          <TabsList className="h-8">
            <TabsTrigger value="daily" className="px-2 text-xs">
              Günlük
            </TabsTrigger>
            <TabsTrigger value="weekly" className="px-2 text-xs">
              Haftalık
            </TabsTrigger>
            <TabsTrigger value="yearly" className="px-2 text-xs">
              Yıllık
            </TabsTrigger>
            <TabsTrigger value="all" className="px-2 text-xs">
              Tüm
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeOpacity={0.15} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: AXIS_COLOR }}
            tickLine={false}
            axisLine={false}
            interval="preserveEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: AXIS_COLOR }}
            tickLine={false}
            axisLine={false}
            width={36}
            allowDecimals={false}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "currentColor", opacity: 0.06 }}
          />
          {series.map((s, i) => (
            <Bar
              key={s.key}
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
        </BarChart>
      </ResponsiveContainer>

      {/* Kategori açıklaması */}
      {series.length > 0 && (
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
        </div>
      )}
    </ChartCard>
  );
}

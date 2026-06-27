import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Category, Task } from "@/lib/database.types";
import { UNCATEGORIZED } from "@/lib/colors";
import { useI18n } from "@/i18n";
import { ChartCard } from "./chart-card";

interface Slice {
  name: string;
  value: number;
  color: string;
}

export function CategoryDistribution({
  tasks,
  categories,
}: {
  tasks: Task[];
  categories: Category[];
}) {
  const { t } = useI18n();
  const uncategorized = t("chart.uncategorized");
  const data = useMemo<Slice[]>(() => {
    const counts = new Map<string, number>();
    for (const t of tasks) {
      const key = t.category_id ?? "none";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const slices: Slice[] = [];
    for (const c of categories) {
      const n = counts.get(c.id);
      if (n) slices.push({ name: c.name, value: n, color: c.color });
    }
    const none = counts.get("none");
    if (none)
      slices.push({
        name: uncategorized,
        value: none,
        color: UNCATEGORIZED.color,
      });
    return slices.sort((a, b) => b.value - a.value);
  }, [tasks, categories, uncategorized]);

  return (
    <ChartCard title={t("chart.taskDistribution")}>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t("chart.noTasks")}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ResponsiveContainer width="100%" height={200} className="max-w-[220px]">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} ${t("chart.tasksUnit")}`,
                  name,
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  fontSize: 13,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-1">
            {data.map((s) => (
              <li key={s.name} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="flex-1 truncate">{s.name}</span>
                <span className="text-muted-foreground">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}

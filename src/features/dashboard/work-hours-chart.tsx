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
import type { TimeEntry } from "@/lib/database.types";
import { ChartCard } from "./chart-card";
import {
  dailyBuckets,
  monthlyThisYear,
  weeklyBuckets,
  yearlyBuckets,
  type Bucket,
} from "./aggregations";

type Range = "daily" | "weekly" | "yearly" | "all";

const BAR_COLOR = "#a78bfa";
const AXIS_COLOR = "#94a3b8";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: Bucket }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const { hours } = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-1.5 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{hours} sa</p>
    </div>
  );
}

export function WorkHoursChart({ entries }: { entries: TimeEntry[] }) {
  const [range, setRange] = useState<Range>("daily");

  const data = useMemo(() => {
    switch (range) {
      case "daily":
        return dailyBuckets(entries, 14);
      case "weekly":
        return weeklyBuckets(entries, 12);
      case "yearly":
        return monthlyThisYear(entries);
      case "all":
        return yearlyBuckets(entries);
    }
  }, [entries, range]);

  return (
    <ChartCard
      title="Çalışma saatleri"
      action={
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
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
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
          <Bar dataKey="hours" fill={BAR_COLOR} radius={[6, 6, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

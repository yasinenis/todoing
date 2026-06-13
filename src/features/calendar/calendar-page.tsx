import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toDayStr } from "@/lib/date";
import type { Category, DayEntry, Goal, Plan, Task } from "@/lib/database.types";
import { useCategories } from "@/features/categories/api";
import { useTasks } from "@/features/tasks/api";
import { useGoals } from "@/features/goals/api";
import { usePlans } from "@/features/planning/api";
import { useDayEntries } from "./api";
import { DayDetailDialog } from "./day-detail-dialog";
import { PlanFormDialog } from "@/features/planning/plan-form-dialog";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function CalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);

  const { data: categories } = useCategories();
  const { data: tasks } = useTasks();
  const { data: goals } = useGoals();
  const { data: plans } = usePlans();
  const { data: dayEntries } = useDayEntries();

  const categoryMap = useMemo(
    () => new Map<string, Category>(categories?.map((c) => [c.id, c])),
    [categories],
  );

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks ?? []) {
      if (!t.planned_date) continue;
      const arr = map.get(t.planned_date) ?? [];
      arr.push(t);
      map.set(t.planned_date, arr);
    }
    return map;
  }, [tasks]);

  const goalsByDay = useMemo(() => {
    const map = new Map<string, Goal[]>();
    for (const g of goals ?? []) {
      const arr = map.get(g.target_date) ?? [];
      arr.push(g);
      map.set(g.target_date, arr);
    }
    return map;
  }, [goals]);

  const entryByDay = useMemo(
    () => new Map<string, DayEntry>((dayEntries ?? []).map((e) => [e.day, e])),
    [dayEntries],
  );

  const plansForDay = (dayStr: string): Plan[] =>
    (plans ?? []).filter((p) => p.start_date <= dayStr && dayStr <= p.end_date);

  const grid = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const selDate = selectedDay;
  const detailPlans = selDate ? plansForDay(selDate) : [];
  const detailTasks = selDate ? (tasksByDay.get(selDate) ?? []) : [];
  const detailGoals = selDate ? (goalsByDay.get(selDate) ?? []) : [];

  return (
    <div>
      <PageHeader
        title="Takvim"
        description="Planlarını gör, her güne değerlendirme ve fotoğraf ekle."
        actions={
          <Button onClick={() => setPlanOpen(true)}>
            <Plus className="h-4 w-4" /> Yeni plan
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">
          {format(month, "MMMM yyyy", { locale: tr })}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth(startOfMonth(new Date()))}
          >
            Bugün
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            aria-label="Önceki ay"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Sonraki ay"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="pb-1 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}

        {grid.map((day) => {
          const dayStr = toDayStr(day);
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);
          const dayPlans = plansForDay(dayStr);
          const dayTasks = tasksByDay.get(dayStr) ?? [];
          const dayGoals = goalsByDay.get(dayStr) ?? [];
          const entry = entryByDay.get(dayStr);

          const dots: string[] = [
            ...dayPlans.map((p) =>
              p.category_id
                ? (categoryMap.get(p.category_id)?.color ?? "hsl(var(--primary))")
                : "hsl(var(--primary))",
            ),
            ...dayTasks.map(() => "hsl(var(--muted-foreground))"),
            ...dayGoals.map(() => "hsl(var(--primary))"),
          ].slice(0, 4);

          return (
            <button
              key={dayStr}
              onClick={() => setSelectedDay(dayStr)}
              className={cn(
                "relative flex aspect-square flex-col rounded-xl border p-1.5 text-left transition-colors hover:bg-accent md:p-2",
                !inMonth && "opacity-40",
                today && "border-primary ring-1 ring-primary",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-medium md:text-sm",
                    today &&
                      "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground md:h-6 md:w-6",
                  )}
                >
                  {format(day, "d")}
                </span>
                <span className="flex items-center gap-0.5">
                  {entry?.rating ? (
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ) : null}
                  {entry?.photo_path ? (
                    <ImageIcon className="h-3 w-3 text-primary" />
                  ) : null}
                </span>
              </div>

              {entry?.mood && (
                <span className="mt-0.5 text-sm leading-none">{entry.mood}</span>
              )}

              <div className="mt-auto flex flex-wrap gap-0.5">
                {dots.map((color, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <DayDetailDialog
        day={selectedDay}
        onOpenChange={(o) => !o && setSelectedDay(null)}
        plans={detailPlans}
        tasks={detailTasks}
        goals={detailGoals}
      />
      <PlanFormDialog
        open={planOpen}
        onOpenChange={setPlanOpen}
        defaultStartDate={selectedDay ?? undefined}
      />
    </div>
  );
}

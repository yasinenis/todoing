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
import { enUS, tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { toDayStr } from "@/lib/date";
import type { Category, DayEntry, Goal, Plan, Task } from "@/lib/database.types";
import { useCategories } from "@/features/categories/api";
import { useTasks } from "@/features/tasks/api";
import { useGoals } from "@/features/goals/api";
import { usePlans } from "@/features/planning/api";
import { useDayEntries, useSignedPhotoUrls } from "./api";
import { DayDetailDialog } from "./day-detail-dialog";
import { PlanFormDialog } from "@/features/planning/plan-form-dialog";

export function CalendarPage() {
  const { t, lang } = useI18n();
  const locale = lang === "en" ? enUS : tr;
  const weekdays = [0, 1, 2, 3, 4, 5, 6].map((i) => t(`heatmap.wd${i}`));
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

  const photoPaths = useMemo(
    () =>
      (dayEntries ?? [])
        .map((e) => e.photo_path)
        .filter((p): p is string => !!p),
    [dayEntries],
  );
  const { data: photoUrls } = useSignedPhotoUrls(photoPaths);

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
        title={t("calendar.title")}
        description={t("calendar.desc")}
        actions={
          <Button onClick={() => setPlanOpen(true)}>
            <Plus className="h-4 w-4" /> {t("calendar.newPlan")}
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">
          {format(month, "MMMM yyyy", { locale })}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth(startOfMonth(new Date()))}
          >
            {t("calendar.today")}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            aria-label={t("heatmap.prevMonth")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label={t("heatmap.nextMonth")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {weekdays.map((d, i) => (
          <div
            key={i}
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
          const photoUrl = entry?.photo_path
            ? photoUrls?.get(entry.photo_path)
            : undefined;

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
                "relative flex aspect-square flex-col overflow-hidden rounded-xl border p-1.5 text-left transition-colors hover:bg-accent md:p-2",
                !inMonth && "opacity-40",
                today && "border-primary ring-1 ring-primary",
              )}
            >
              {photoUrl && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url(${photoUrl})` }}
                />
              )}
              <div className="relative z-10 flex items-center justify-between">
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
                <span className="relative z-10 mt-0.5 text-sm leading-none">
                  {entry.mood}
                </span>
              )}

              <div className="relative z-10 mt-auto flex flex-wrap gap-0.5">
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

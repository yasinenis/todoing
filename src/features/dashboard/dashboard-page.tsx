import { useMemo } from "react";
import { Clock, Flame, CheckCircle2, Target, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Stagger, FadeUp } from "@/components/motion";
import { formatDuration } from "@/lib/utils";
import { formatLong, today } from "@/lib/date";
import type { Category } from "@/lib/database.types";
import { useTasks } from "@/features/tasks/api";
import { useCategories } from "@/features/categories/api";
import { useGoals } from "@/features/goals/api";
import { useHabits, useHabitLogs } from "@/features/habits/api";
import { computeStreaks } from "@/features/habits/habit-stats";
import { GoalCard } from "@/features/goals/goal-card";
import { LONG_TERM } from "@/features/goals/goal-meta";
import { useTimeEntries } from "./api";
import { todaySeconds } from "./aggregations";
import { WorkHoursChart } from "./work-hours-chart";
import { TodayHabits } from "./today-habits";
import { CategoryDistribution } from "./category-distribution";
import { StatCard } from "./stat-card";
import { quoteOfTheDay } from "./quotes";

export function DashboardPage() {
  const entries = useTimeEntries();
  const { data: tasks } = useTasks();
  const { data: categories } = useCategories();
  const { data: goals } = useGoals();
  const { data: habits } = useHabits();
  const { data: habitLogs } = useHabitLogs();

  const todayStr = today();

  const categoryMap = useMemo(
    () => new Map<string, Category>(categories?.map((c) => [c.id, c])),
    [categories],
  );

  const linkedStats = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    for (const t of tasks ?? []) {
      if (!t.goal_id) continue;
      const cur = map.get(t.goal_id) ?? { total: 0, done: 0 };
      cur.total += 1;
      if (t.status === "done") cur.done += 1;
      map.set(t.goal_id, cur);
    }
    return map;
  }, [tasks]);

  const doneToday = (tasks ?? []).filter(
    (t) => t.status === "done" && t.completed_at?.startsWith(todayStr),
  ).length;

  const bestCurrentStreak = useMemo(() => {
    if (!habits?.length) return 0;
    const byHabit = new Map<string, Map<string, number>>();
    for (const log of habitLogs ?? []) {
      let inner = byHabit.get(log.habit_id);
      if (!inner) {
        inner = new Map();
        byHabit.set(log.habit_id, inner);
      }
      inner.set(log.day, log.count);
    }
    let best = 0;
    for (const h of habits) {
      const { current } = computeStreaks(
        byHabit.get(h.id) ?? new Map(),
        h.target_per_day,
      );
      best = Math.max(best, current);
    }
    return best;
  }, [habits, habitLogs]);

  const activeGoals = (goals ?? []).filter((g) => g.status === "active");
  const longTermGoals = activeGoals
    .filter((g) => LONG_TERM.includes(g.timeframe))
    .slice(0, 4);

  const isLoading = entries.isLoading && !entries.data;
  const workEntries = entries.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Merhaba 👋`}
        description={formatLong(new Date())}
      />

      {/* Motivasyon */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/20">
        <CardContent className="flex items-center gap-3 p-4">
          <Sparkles className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm font-medium">{quoteOfTheDay()}</p>
        </CardContent>
      </Card>

      {/* İstatistikler */}
      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <FadeUp>
          <StatCard
            icon={Clock}
            label="Bugün çalışma"
            value={formatDuration(todaySeconds(workEntries), true)}
            color="#a78bfa"
          />
        </FadeUp>
        <FadeUp>
          <StatCard
            icon={CheckCircle2}
            label="Bugün tamamlanan"
            value={`${doneToday}`}
            hint="görev"
            color="#34d399"
          />
        </FadeUp>
        <FadeUp>
          <StatCard
            icon={Flame}
            label="En uzun aktif seri"
            value={`${bestCurrentStreak}`}
            hint="gün"
            color="#fb923c"
          />
        </FadeUp>
        <FadeUp>
          <StatCard
            icon={Target}
            label="Aktif hedef"
            value={`${activeGoals.length}`}
            color="#60a5fa"
          />
        </FadeUp>
      </Stagger>

      <TodayHabits />

      {isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <WorkHoursChart
          entries={workEntries}
          tasks={tasks ?? []}
          categories={categories ?? []}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryDistribution tasks={tasks ?? []} categories={categories ?? []} />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Uzun vadeli hedefler
          </h3>
          {longTermGoals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Uzun vadeli hedef yok"
              description="3 aylık veya yıllık bir hedef ekle; burada hep göz önünde olsun."
            />
          ) : (
            <div className="space-y-3">
              {longTermGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  category={
                    goal.category_id
                      ? categoryMap.get(goal.category_id)
                      : undefined
                  }
                  linked={linkedStats.get(goal.id) ?? { total: 0, done: 0 }}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

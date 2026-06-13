import { useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Goal } from "@/lib/database.types";
import { useCategories } from "@/features/categories/api";
import { useTasks } from "@/features/tasks/api";
import { useGoals, useDeleteGoal } from "./api";
import { GoalCard } from "./goal-card";
import { GoalFormDialog } from "./goal-form-dialog";
import { TIMEFRAME_LABELS, TIMEFRAME_ORDER } from "./goal-meta";

export function GoalsPage() {
  const { data: goals, isLoading } = useGoals();
  const { data: categories } = useCategories();
  const { data: tasks } = useTasks();
  const del = useDeleteGoal();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories?.map((c) => [c.id, c])),
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

  const grouped = useMemo(() => {
    return TIMEFRAME_ORDER.map((tf) => ({
      timeframe: tf,
      items: (goals ?? []).filter((g) => g.timeframe === tf),
    })).filter((g) => g.items.length > 0);
  }, [goals]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting.id);
      toast.success("Hedef silindi");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silme başarısız");
    }
  };

  return (
    <div>
      <PageHeader
        title="Hedefler"
        description="Günlük, aylık, 3 aylık ve yıllık hedeflerini hep göz önünde tut."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Yeni hedef
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !goals?.length ? (
        <EmptyState
          icon={Target}
          title="Henüz hedef yok"
          description="İlk hedefini belirle; ne kadar sürede gerçekleştireceğini seç ve ilerlemeni izle."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Yeni hedef
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {grouped.map(({ timeframe, items }) => (
            <section key={timeframe}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {TIMEFRAME_LABELS[timeframe]}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    category={
                      goal.category_id
                        ? categoryMap.get(goal.category_id)
                        : undefined
                    }
                    linked={
                      linkedStats.get(goal.id) ?? { total: 0, done: 0 }
                    }
                    onEdit={(g) => {
                      setEditing(g);
                      setFormOpen(true);
                    }}
                    onDelete={setDeleting}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <GoalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`"${deleting?.title}" silinsin mi?`}
        description="Hedef silinir; bağlı görevler kalır (hedef bağlantısı kaldırılır)."
        confirmLabel="Sil"
        destructive
        loading={del.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

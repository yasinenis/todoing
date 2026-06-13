import { useMemo, useState } from "react";
import { Flame, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Habit } from "@/lib/database.types";
import { useHabits, useHabitLogs, useDeleteHabit } from "./api";
import { HabitCard } from "./habit-card";
import { HabitFormDialog } from "./habit-form-dialog";

export function HabitsPage() {
  const { data: habits, isLoading } = useHabits();
  const { data: logs } = useHabitLogs();
  const del = useDeleteHabit();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [deleting, setDeleting] = useState<Habit | null>(null);

  // habitId → (gün → count)
  const logsByHabit = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const log of logs ?? []) {
      let inner = map.get(log.habit_id);
      if (!inner) {
        inner = new Map();
        map.set(log.habit_id, inner);
      }
      inner.set(log.day, log.count);
    }
    return map;
  }, [logs]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting.id);
      toast.success("Alışkanlık silindi");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silme başarısız");
    }
  };

  const visible = (habits ?? []).filter((h) => !h.archived);

  return (
    <div>
      <PageHeader
        title="Alışkanlıklar"
        description="Her alışkanlık kendi renginde — serini büyüt, günlük takip et."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Yeni alışkanlık
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : !visible.length ? (
        <EmptyState
          icon={Flame}
          title="Henüz alışkanlık yok"
          description="İlk alışkanlığını ekle; her gün işaretle ve renkli katkı grafiğinde serini izle."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Yeni alışkanlık
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logs={logsByHabit.get(habit.id) ?? new Map()}
              onEdit={(h) => {
                setEditing(h);
                setFormOpen(true);
              }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <HabitFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        habit={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`"${deleting?.name}" silinsin mi?`}
        description="Alışkanlık ve tüm günlük kayıtları kalıcı olarak silinir."
        confirmLabel="Sil"
        destructive
        loading={del.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

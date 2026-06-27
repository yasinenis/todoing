import { useMemo, useState } from "react";
import { isThisMonth, isThisWeek, isToday, parseISO } from "date-fns";
import { ListTodo, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "@/lib/database.types";
import { useI18n } from "@/i18n";
import { useCategories } from "@/features/categories/api";
import { useTasks, useDeleteTask } from "./api";
import { TaskCard } from "./task-card";
import { TaskFormDialog } from "./task-form-dialog";

type StatusFilter = "all" | "active" | "done";
type GroupKey = "today" | "week" | "month" | "later" | "none";

const SECTIONS: { key: GroupKey; labelKey: string }[] = [
  { key: "today", labelKey: "tasks.section.today" },
  { key: "week", labelKey: "tasks.section.week" },
  { key: "month", labelKey: "tasks.section.month" },
  { key: "later", labelKey: "tasks.section.later" },
  { key: "none", labelKey: "tasks.section.none" },
];

export function TasksPage() {
  const { t } = useI18n();
  const { data: tasks, isLoading } = useTasks();
  const { data: categories } = useCategories();
  const del = useDeleteTask();

  const [status, setStatus] = useState<StatusFilter>("active");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories?.map((c) => [c.id, c])),
    [categories],
  );

  const filtered = useMemo(() => {
    return (tasks ?? []).filter((t) => {
      if (status === "active" && t.status === "done") return false;
      if (status === "done" && t.status !== "done") return false;
      if (categoryFilter === "none" && t.category_id !== null) return false;
      if (
        categoryFilter !== "all" &&
        categoryFilter !== "none" &&
        t.category_id !== categoryFilter
      )
        return false;
      return true;
    });
  }, [tasks, status, categoryFilter]);

  // Görevleri tarihe göre grupla (planlanan, yoksa son tarih).
  const groups = useMemo(() => {
    const b: Record<GroupKey, Task[]> = {
      today: [],
      week: [],
      month: [],
      later: [],
      none: [],
    };
    for (const t of filtered) {
      const ds = t.planned_date ?? t.due_date;
      if (!ds) {
        b.none.push(t);
        continue;
      }
      const d = parseISO(ds);
      if (isToday(d)) b.today.push(t);
      else if (isThisWeek(d, { weekStartsOn: 1 })) b.week.push(t);
      else if (isThisMonth(d)) b.month.push(t);
      else b.later.push(t);
    }
    return b;
  }, [filtered]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (task: Task) => {
    setEditing(task);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting.id);
      toast.success(t("tasks.deleted"));
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("tasks.deleteFailed"));
    }
  };

  return (
    <div>
      <PageHeader
        title={t("tasks.title")}
        description={t("tasks.desc")}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> {t("tasks.new")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tabs value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="active">{t("tasks.filter.active")}</TabsTrigger>
            <TabsTrigger value="done">{t("tasks.filter.done")}</TabsTrigger>
            <TabsTrigger value="all">{t("tasks.filter.all")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("tasks.allCategories")}</SelectItem>
            <SelectItem value="none">{t("tasks.noCategory")}</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          icon={ListTodo}
          title={t("tasks.emptyTitle")}
          description={t("tasks.emptyDesc")}
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> {t("tasks.new")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {SECTIONS.map(({ key, labelKey }) => {
            const items = groups[key];
            if (!items.length) return null;
            return (
              <section key={key}>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t(labelKey)}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      category={
                        task.category_id
                          ? categoryMap.get(task.category_id)
                          : undefined
                      }
                      onEdit={openEdit}
                      onDelete={setDeleting}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("tasks.deleteTitle", { title: deleting?.title ?? "" })}
        description={t("tasks.deleteDesc")}
        confirmLabel={t("common.delete")}
        destructive
        loading={del.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

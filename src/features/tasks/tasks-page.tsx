import { useMemo, useState } from "react";
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
import { useCategories } from "@/features/categories/api";
import { useTasks, useDeleteTask } from "./api";
import { TaskCard } from "./task-card";
import { TaskFormDialog } from "./task-form-dialog";

type StatusFilter = "all" | "active" | "done";

export function TasksPage() {
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
      toast.success("Görev silindi");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silme başarısız");
    }
  };

  return (
    <div>
      <PageHeader
        title="Görevler"
        description="Yapılacaklarını yönet, sayaç ile süreni kaydet."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Yeni görev
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tabs value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="active">Aktif</TabsTrigger>
            <TabsTrigger value="done">Tamamlanan</TabsTrigger>
            <TabsTrigger value="all">Hepsi</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm kategoriler</SelectItem>
            <SelectItem value="none">Kategorisiz</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          icon={ListTodo}
          title="Görev yok"
          description="Bu görünümde görev yok. Yeni bir görev ekleyerek başla."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Yeni görev
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
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
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`"${deleting?.title}" silinsin mi?`}
        description="Bu görev ve kayıtlı süreleri kalıcı olarak silinir."
        confirmLabel="Sil"
        destructive
        loading={del.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

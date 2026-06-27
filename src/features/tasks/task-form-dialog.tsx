import { useEffect, useState } from "react";
import { toast } from "sonner";
import { playSound } from "@/lib/sound";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Priority, Task } from "@/lib/database.types";
import { useI18n } from "@/i18n";
import { useCategories } from "@/features/categories/api";
import { useGoals } from "@/features/goals/api";
import { PRIORITY_LABEL_KEYS } from "./task-meta";
import { useCreateTask, useUpdateTask } from "./api";

const NO_CATEGORY = "none";
const NO_GOAL = "none";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultPlannedDate?: string | null;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultPlannedDate,
}: Props) {
  const { t } = useI18n();
  const { data: categories } = useCategories();
  const { data: goals } = useGoals();
  const create = useCreateTask();
  const update = useUpdateTask();
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [categoryId, setCategoryId] = useState<string>(NO_CATEGORY);
  const [goalId, setGoalId] = useState<string>(NO_GOAL);
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [plannedDate, setPlannedDate] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setNotes(task?.notes ?? "");
    setCategoryId(task?.category_id ?? NO_CATEGORY);
    setGoalId(task?.goal_id ?? NO_GOAL);
    setPriority(task?.priority ?? "medium");
    setDueDate(task?.due_date ?? "");
    setPlannedDate(task?.planned_date ?? defaultPlannedDate ?? "");
  }, [open, task, defaultPlannedDate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      notes: notes.trim() || null,
      category_id: categoryId === NO_CATEGORY ? null : categoryId,
      goal_id: goalId === NO_GOAL ? null : goalId,
      priority,
      due_date: dueDate || null,
      planned_date: plannedDate || null,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: task.id, ...payload });
        toast.success(t("taskForm.updated"));
      } else {
        await create.mutateAsync(payload);
        playSound("tap");
        toast.success(t("taskForm.created"));
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("taskForm.failed"));
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("taskForm.editTitle") : t("taskForm.newTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">{t("taskForm.title")}</Label>
            <Input
              id="task-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("taskForm.titlePlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-notes">{t("taskForm.notes")}</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("taskForm.notesPlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("taskForm.category")}</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>
                    {t("tasks.noCategory")}
                  </SelectItem>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("taskForm.priority")}</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["low", "medium", "high"] as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {t(PRIORITY_LABEL_KEYS[p])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-planned">{t("taskForm.plannedDay")}</Label>
              <Input
                id="task-planned"
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">{t("taskForm.dueDate")}</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("taskForm.linkGoal")}</Label>
            <Select value={goalId} onValueChange={setGoalId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_GOAL}>{t("taskForm.noGoal")}</SelectItem>
                {goals?.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending || !title.trim()}>
              {isEdit ? t("common.save") : t("common.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

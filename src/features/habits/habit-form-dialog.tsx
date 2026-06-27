import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { ColorPicker } from "@/components/color-picker";
import { DEFAULT_HABIT_COLOR } from "@/lib/colors";
import type { Habit } from "@/lib/database.types";
import { useI18n } from "@/i18n";
import { useCreateHabit, useUpdateHabit } from "./api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
}

export function HabitFormDialog({ open, onOpenChange, habit }: Props) {
  const { t } = useI18n();
  const create = useCreateHabit();
  const update = useUpdateHabit();
  const isEdit = !!habit;

  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_HABIT_COLOR);
  const [target, setTarget] = useState(1);

  useEffect(() => {
    if (!open) return;
    setName(habit?.name ?? "");
    setColor(habit?.color ?? DEFAULT_HABIT_COLOR);
    setTarget(habit?.target_per_day ?? 1);
  }, [open, habit]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (isEdit) {
        await update.mutateAsync({
          id: habit.id,
          name: name.trim(),
          color,
          target_per_day: Math.max(1, target),
        });
        toast.success(t("habitForm.updated"));
      } else {
        await create.mutateAsync({
          name: name.trim(),
          color,
          target_per_day: Math.max(1, target),
        });
        toast.success(t("habitForm.created"));
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("taskForm.failed"));
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("habitForm.editTitle") : t("habitForm.newTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="habit-name">{t("habitForm.name")}</Label>
            <Input
              id="habit-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("habitForm.namePlaceholder")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="habit-target">{t("habitForm.dailyTarget")}</Label>
            <Input
              id="habit-target"
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {t("habitForm.targetHint")}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t("habitForm.color")}</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {isEdit ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

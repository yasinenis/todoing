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
import { useCreateHabit, useUpdateHabit } from "./api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
}

export function HabitFormDialog({ open, onOpenChange, habit }: Props) {
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
        toast.success("Alışkanlık güncellendi");
      } else {
        await create.mutateAsync({
          name: name.trim(),
          color,
          target_per_day: Math.max(1, target),
        });
        toast.success("Alışkanlık oluşturuldu");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem başarısız");
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Alışkanlığı düzenle" : "Yeni alışkanlık"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="habit-name">Ad</Label>
            <Input
              id="habit-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ör. Su iç, Spor, Oku"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="habit-target">Günlük hedef</Label>
            <Input
              id="habit-target"
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Örn. günde 8 bardak su için 8 yaz. Tek seferlikse 1 bırak.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Renk</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {isEdit ? "Kaydet" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fromDayStr, formatLong, today } from "@/lib/date";
import type { Goal, GoalTimeframe } from "@/lib/database.types";
import { useCategories } from "@/features/categories/api";
import { TIMEFRAME_LABELS, TIMEFRAME_ORDER, computeTargetDate } from "./goal-meta";
import { useCreateGoal, useUpdateGoal } from "./api";

const NO_CATEGORY = "none";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
}

export function GoalFormDialog({ open, onOpenChange, goal }: Props) {
  const { data: categories } = useCategories();
  const create = useCreateGoal();
  const update = useUpdateGoal();
  const isEdit = !!goal;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(NO_CATEGORY);
  const [timeframe, setTimeframe] = useState<GoalTimeframe>("monthly");
  const [dailyDays, setDailyDays] = useState(3);
  const [startDate, setStartDate] = useState(today());
  const [autoProgress, setAutoProgress] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(goal?.title ?? "");
    setDescription(goal?.description ?? "");
    setCategoryId(goal?.category_id ?? NO_CATEGORY);
    setTimeframe(goal?.timeframe ?? "monthly");
    setStartDate(goal?.start_date ?? today());
    setAutoProgress(goal?.auto_progress ?? false);
    setDailyDays(3);
  }, [open, goal]);

  const targetDate = computeTargetDate(
    timeframe,
    fromDayStr(startDate),
    dailyDays,
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId === NO_CATEGORY ? null : categoryId,
      timeframe,
      start_date: startDate,
      target_date: targetDate,
      auto_progress: autoProgress,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: goal.id, ...payload });
        toast.success("Hedef güncellendi");
      } else {
        await create.mutateAsync(payload);
        toast.success("Hedef oluşturuldu");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem başarısız");
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Hedefi düzenle" : "Yeni hedef"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">Başlık</Label>
            <Input
              id="goal-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ör. 12 kitap oku"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-desc">Açıklama (opsiyonel)</Label>
            <Textarea
              id="goal-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Zaman dilimi</Label>
              <Select
                value={timeframe}
                onValueChange={(v) => setTimeframe(v as GoalTimeframe)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAME_ORDER.map((tf) => (
                    <SelectItem key={tf} value={tf}>
                      {TIMEFRAME_LABELS[tf]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-start">Başlangıç</Label>
              <Input
                id="goal-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          {timeframe === "daily" && (
            <div className="space-y-1.5">
              <Label htmlFor="goal-days">Kaç gün? (1-7)</Label>
              <Input
                id="goal-days"
                type="number"
                min={1}
                max={7}
                value={dailyDays}
                onChange={(e) => setDailyDays(Number(e.target.value))}
              />
            </div>
          )}

          <div className="rounded-xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
            Hedef tarihi: <strong>{formatLong(targetDate)}</strong>
          </div>

          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>Kategorisiz</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <p className="text-sm font-medium">Otomatik ilerleme</p>
              <p className="text-xs text-muted-foreground">
                İlerlemeyi bağlı görevlerin tamamlanmasından hesapla
              </p>
            </div>
            <Switch checked={autoProgress} onCheckedChange={setAutoProgress} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" disabled={pending || !title.trim()}>
              {isEdit ? "Kaydet" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { fromDayStr, formatLong, today } from "@/lib/date";
import type { PlanPeriod } from "@/lib/database.types";
import { useCategories } from "@/features/categories/api";
import { PERIOD_LABEL_KEYS, PERIOD_ORDER, computeEndDate } from "./plan-meta";
import { useCreatePlan } from "./api";

const NO_CATEGORY = "none";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStartDate?: string;
}

export function PlanFormDialog({ open, onOpenChange, defaultStartDate }: Props) {
  const { t } = useI18n();
  const { data: categories } = useCategories();
  const create = useCreatePlan();

  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState<PlanPeriod>("1w");
  const [startDate, setStartDate] = useState(today());
  const [categoryId, setCategoryId] = useState(NO_CATEGORY);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setPeriod("1w");
    setStartDate(defaultStartDate ?? today());
    setCategoryId(NO_CATEGORY);
  }, [open, defaultStartDate]);

  const endDate = computeEndDate(period, fromDayStr(startDate));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await create.mutateAsync({
        title: title.trim(),
        period,
        start_date: startDate,
        end_date: endDate,
        category_id: categoryId === NO_CATEGORY ? null : categoryId,
      });
      toast.success(t("planForm.added"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("taskForm.failed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("planForm.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="plan-title">{t("taskForm.title")}</Label>
            <Input
              id="plan-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("planForm.titlePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("planForm.duration")}</Label>
            <div className="flex flex-wrap gap-2">
              {PERIOD_ORDER.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    period === p
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:bg-accent",
                  )}
                >
                  {t(PERIOD_LABEL_KEYS[p])}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-start">{t("planForm.startDay")}</Label>
            <Input
              id="plan-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

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

          <div className="rounded-xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
            {formatLong(startDate)} → <strong>{formatLong(endDate)}</strong>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={create.isPending || !title.trim()}>
              {t("common.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

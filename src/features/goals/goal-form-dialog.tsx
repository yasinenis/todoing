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
import { cn } from "@/lib/utils";
import { fromDayStr, formatLong, today } from "@/lib/date";
import type { Goal, GoalTimeframe } from "@/lib/database.types";
import { useI18n } from "@/i18n";
import { useCategories } from "@/features/categories/api";
import {
  TIMEFRAME_LABEL_KEYS,
  TIMEFRAME_ORDER,
  computeTargetDate,
  inferTimeframe,
} from "./goal-meta";
import { useCreateGoal, useUpdateGoal } from "./api";

const NO_CATEGORY = "none";
type Mode = "preset" | "custom";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
}

export function GoalFormDialog({ open, onOpenChange, goal }: Props) {
  const { t } = useI18n();
  const { data: categories } = useCategories();
  const create = useCreateGoal();
  const update = useUpdateGoal();
  const isEdit = !!goal;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(NO_CATEGORY);
  const [mode, setMode] = useState<Mode>("preset");
  const [timeframe, setTimeframe] = useState<GoalTimeframe>("monthly");
  const [dailyDays, setDailyDays] = useState(3);
  const [startDate, setStartDate] = useState(today());
  const [customTarget, setCustomTarget] = useState("");
  const [autoProgress, setAutoProgress] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(goal?.title ?? "");
    setDescription(goal?.description ?? "");
    setCategoryId(goal?.category_id ?? NO_CATEGORY);
    setMode("preset");
    setTimeframe(goal?.timeframe ?? "monthly");
    setStartDate(goal?.start_date ?? today());
    setCustomTarget(goal?.target_date ?? "");
    setAutoProgress(goal?.auto_progress ?? false);
    setDailyDays(3);
  }, [open, goal]);

  // Hesaplanan hedef tarihi + zaman dilimi (moda göre).
  const presetTarget = computeTargetDate(
    timeframe,
    fromDayStr(startDate),
    dailyDays,
  );
  const targetDate = mode === "custom" ? customTarget : presetTarget;
  const effectiveTimeframe =
    mode === "custom" && customTarget
      ? inferTimeframe(fromDayStr(startDate), fromDayStr(customTarget))
      : timeframe;
  const customInvalid =
    mode === "custom" && (!customTarget || customTarget < startDate);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || customInvalid) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId === NO_CATEGORY ? null : categoryId,
      timeframe: effectiveTimeframe,
      start_date: startDate,
      target_date: targetDate,
      auto_progress: autoProgress,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: goal.id, ...payload });
        toast.success(t("goalForm.updated"));
      } else {
        await create.mutateAsync(payload);
        toast.success(t("goalForm.created"));
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("taskForm.failed"));
    }
  };

  const pending = create.isPending || update.isPending;

  const modeBtn = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={cn(
        "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        mode === m
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground",
      )}
    >
      {label}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("goalForm.editTitle") : t("goalForm.newTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">{t("taskForm.title")}</Label>
            <Input
              id="goal-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("goalForm.titlePlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-desc">{t("goalForm.desc")}</Label>
            <Textarea
              id="goal-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Mod seçimi: hazır süre mi, serbest tarih aralığı mı */}
          <div className="flex gap-1 rounded-xl bg-muted p-1">
            {modeBtn("preset", t("goalForm.modePreset"))}
            {modeBtn("custom", t("goalForm.modeCustom"))}
          </div>

          {mode === "preset" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("goalForm.timeframe")}</Label>
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
                          {t(TIMEFRAME_LABEL_KEYS[tf])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="goal-start">{t("goalForm.start")}</Label>
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
                  <Label htmlFor="goal-days">{t("goalForm.days")}</Label>
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
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="goal-start-c">{t("goalForm.start")}</Label>
                <Input
                  id="goal-start-c"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-target-c">{t("goalForm.endTarget")}</Label>
                <Input
                  id="goal-target-c"
                  type="date"
                  min={startDate}
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                />
              </div>
            </div>
          )}

          {customInvalid ? (
            <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {t("goalForm.invalidEnd")}
            </div>
          ) : (
            <div className="rounded-xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              {t("goalForm.targetDate")} <strong>{formatLong(targetDate)}</strong>
            </div>
          )}

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

          <div className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <p className="text-sm font-medium">{t("goalForm.autoProgress")}</p>
              <p className="text-xs text-muted-foreground">
                {t("goalForm.autoProgressDesc")}
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
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={pending || !title.trim() || customInvalid}
            >
              {isEdit ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

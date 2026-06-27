import { useEffect, useRef, useState } from "react";
import { CalendarClock, Flag, ImagePlus, ListTodo, Star, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { formatLong } from "@/lib/date";
import type { Goal, Plan, Task } from "@/lib/database.types";
import { PERIOD_LABEL_KEYS } from "@/features/planning/plan-meta";
import {
  useDayEntry,
  useUpsertDayEntry,
  useSignedPhotoUrl,
  uploadDayPhoto,
  removeDayPhoto,
} from "./api";

const MOODS = ["😣", "😕", "😐", "🙂", "😄"];

interface Props {
  day: string | null;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  tasks: Task[];
  goals: Goal[];
}

export function DayDetailDialog({ day, onOpenChange, plans, tasks, goals }: Props) {
  const { t } = useI18n();
  const entry = useDayEntry(day);
  const upsert = useUpsertDayEntry();
  const fileInput = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState<number>(0);
  const [mood, setMood] = useState<string>("");
  const [reflection, setReflection] = useState("");
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const signed = useSignedPhotoUrl(file ? null : photoPath);

  useEffect(() => {
    if (!day) return;
    const e = entry.data;
    setRating(e?.rating ?? 0);
    setMood(e?.mood ?? "");
    setReflection(e?.reflection ?? "");
    setPhotoPath(e?.photo_path ?? null);
    setFile(null);
    setLocalPreview(null);
  }, [day, entry.data]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLocalPreview(URL.createObjectURL(f));
  };

  const clearPhoto = () => {
    setFile(null);
    setLocalPreview(null);
    setPhotoPath(null);
  };

  const save = async () => {
    if (!day) return;
    setSaving(true);
    try {
      let nextPath = photoPath;
      const oldPath = entry.data?.photo_path ?? null;

      if (file) {
        nextPath = await uploadDayPhoto(file, day);
        if (oldPath && oldPath !== nextPath) await removeDayPhoto(oldPath);
      } else if (oldPath && photoPath === null) {
        // Fotoğraf kaldırıldı
        await removeDayPhoto(oldPath);
        nextPath = null;
      }

      await upsert.mutateAsync({
        day,
        rating: rating || null,
        mood: mood || null,
        reflection: reflection.trim() || null,
        photo_path: nextPath,
      });
      toast.success(t("dayDetail.saved"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("dayDetail.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = localPreview ?? signed.data ?? null;
  const showPhoto = file ? localPreview : photoPath ? previewUrl : null;

  return (
    <Dialog open={!!day} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{day ? formatLong(day) : ""}</DialogTitle>
        </DialogHeader>

        {/* O güne ait planlar / görevler / hedefler */}
        {(plans.length > 0 || tasks.length > 0 || goals.length > 0) && (
          <div className="space-y-1.5">
            {plans.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-1.5 text-sm"
              >
                <CalendarClock className="h-4 w-4 text-primary" />
                <span className="flex-1 truncate">{p.title}</span>
                <span className="text-xs text-muted-foreground">
                  {t(PERIOD_LABEL_KEYS[p.period])}
                </span>
              </div>
            ))}
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 text-sm"
              >
                <ListTodo className="h-4 w-4 text-muted-foreground" />
                <span
                  className={cn(
                    "flex-1 truncate",
                    t.status === "done" && "line-through opacity-60",
                  )}
                >
                  {t.title}
                </span>
              </div>
            ))}
            {goals.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-2 rounded-lg bg-accent/40 px-3 py-1.5 text-sm"
              >
                <Flag className="h-4 w-4 text-primary" />
                <span className="flex-1 truncate">
                  {t("dayDetail.goal", { title: g.title })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Değerlendirme */}
        <div className="space-y-4 border-t pt-4">
          <div className="space-y-1.5">
            <Label>{t("dayDetail.rateDay")}</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? 0 : n)}
                  aria-label={t("dayDetail.stars", { n })}
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      n <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("dayDetail.mood")}</Label>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(mood === m ? "" : m)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition-colors",
                    mood === m ? "border-primary bg-primary/10" : "hover:bg-accent",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reflection">{t("dayDetail.reflection")}</Label>
            <Textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder={t("dayDetail.reflectionPlaceholder")}
              className="min-h-[100px]"
            />
          </div>

          {/* Günün fotoğrafı */}
          <div className="space-y-1.5">
            <Label>{t("dayDetail.photo")}</Label>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onPickFile}
            />
            {showPhoto ? (
              <div className="relative overflow-hidden rounded-xl border">
                <img
                  src={showPhoto}
                  alt={t("dayDetail.photo")}
                  className="max-h-64 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                  aria-label={t("dayDetail.removePhoto")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInput.current?.click()}
              >
                <ImagePlus className="h-4 w-4" /> {t("dayDetail.addPhoto")}
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.close")}
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? t("dayDetail.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

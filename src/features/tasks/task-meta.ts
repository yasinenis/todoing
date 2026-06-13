import type { Priority, TaskStatus } from "@/lib/database.types";

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

export const PRIORITY_BADGE: Record<
  Priority,
  "secondary" | "default" | "destructive"
> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Yapılacak",
  in_progress: "Devam ediyor",
  done: "Tamamlandı",
};

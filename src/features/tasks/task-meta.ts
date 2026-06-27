import type { Priority, TaskStatus } from "@/lib/database.types";

/** Öncelik etiketleri i18n anahtarı olarak; render'da t() ile çözülür. */
export const PRIORITY_LABEL_KEYS: Record<Priority, string> = {
  low: "priority.low",
  medium: "priority.medium",
  high: "priority.high",
};

export const PRIORITY_BADGE: Record<
  Priority,
  "secondary" | "default" | "destructive"
> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

export const STATUS_LABEL_KEYS: Record<TaskStatus, string> = {
  todo: "status.todo",
  in_progress: "status.inProgress",
  done: "status.done",
};

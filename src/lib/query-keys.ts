/** TanStack Query anahtarları — tek yerden yönetilir. */
export const qk = {
  categories: ["categories"] as const,
  categoryUsage: (id: string) => ["categories", id, "usage"] as const,
  tasks: (filters?: Record<string, unknown>) =>
    filters ? (["tasks", filters] as const) : (["tasks"] as const),
  task: (id: string) => ["tasks", id] as const,
  activeTimer: ["timer", "active"] as const,
  timeEntries: (range?: Record<string, unknown>) =>
    range ? (["time_entries", range] as const) : (["time_entries"] as const),
  goals: ["goals"] as const,
  goal: (id: string) => ["goals", id] as const,
  habits: ["habits"] as const,
  habitLogs: (range?: Record<string, unknown>) =>
    range ? (["habit_logs", range] as const) : (["habit_logs"] as const),
  plans: (range?: Record<string, unknown>) =>
    range ? (["plans", range] as const) : (["plans"] as const),
  dayEntry: (day: string) => ["day_entries", day] as const,
  dayEntries: (range?: Record<string, unknown>) =>
    range ? (["day_entries", range] as const) : (["day_entries"] as const),
} as const;

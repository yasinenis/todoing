import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { requireUserId } from "@/lib/auth-helpers";
import { qk } from "@/lib/query-keys";
import type { Priority, Task, TaskStatus } from "@/lib/database.types";

export function useTasks() {
  return useQuery({
    queryKey: qk.tasks(),
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export interface TaskInput {
  title: string;
  notes?: string | null;
  category_id?: string | null;
  goal_id?: string | null;
  priority?: Priority;
  status?: TaskStatus;
  due_date?: string | null;
  planned_date?: string | null;
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TaskInput) => {
      const user_id = await requireUserId();
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...input, user_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks() }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<TaskInput>) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks() }),
  });
}

export function useToggleTaskDone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: Task) => {
      const done = task.status !== "done";
      const { data, error } = await supabase
        .from("tasks")
        .update({
          status: done ? "done" : "todo",
          completed_at: done ? new Date().toISOString() : null,
        })
        .eq("id", task.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks() }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tasks() });
      qc.invalidateQueries({ queryKey: qk.activeTimer });
    },
  });
}

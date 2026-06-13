import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { requireUserId } from "@/lib/auth-helpers";
import { qk } from "@/lib/query-keys";
import type { Goal, GoalStatus, GoalTimeframe } from "@/lib/database.types";

export function useGoals() {
  return useQuery({
    queryKey: qk.goals,
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("target_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export interface GoalInput {
  title: string;
  description?: string | null;
  category_id?: string | null;
  parent_goal_id?: string | null;
  timeframe: GoalTimeframe;
  start_date: string;
  target_date: string;
  progress?: number;
  auto_progress?: boolean;
  status?: GoalStatus;
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: GoalInput) => {
      const user_id = await requireUserId();
      const { data, error } = await supabase
        .from("goals")
        .insert({ ...input, user_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.goals }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<GoalInput>) => {
      const { data, error } = await supabase
        .from("goals")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.goals }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.goals });
      qc.invalidateQueries({ queryKey: qk.tasks() });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { requireUserId } from "@/lib/auth-helpers";
import { qk } from "@/lib/query-keys";
import type { Plan, PlanPeriod } from "@/lib/database.types";

export function usePlans() {
  return useQuery({
    queryKey: qk.plans(),
    queryFn: async (): Promise<Plan[]> => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export interface PlanInput {
  title: string;
  notes?: string | null;
  category_id?: string | null;
  period: PlanPeriod;
  start_date: string;
  end_date: string;
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PlanInput) => {
      const user_id = await requireUserId();
      const { data, error } = await supabase
        .from("plans")
        .insert({ ...input, user_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.plans() }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.plans() }),
  });
}

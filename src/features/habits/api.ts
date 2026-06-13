import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { requireUserId } from "@/lib/auth-helpers";
import { qk } from "@/lib/query-keys";
import type { Habit, HabitLog } from "@/lib/database.types";

export function useHabits() {
  return useQuery({
    queryKey: qk.habits,
    queryFn: async (): Promise<Habit[]> => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useHabitLogs() {
  return useQuery({
    queryKey: qk.habitLogs(),
    queryFn: async (): Promise<HabitLog[]> => {
      const { data, error } = await supabase.from("habit_logs").select("*");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      color: string;
      target_per_day: number;
    }) => {
      const user_id = await requireUserId();
      const { data, error } = await supabase
        .from("habits")
        .insert({ ...input, user_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.habits }),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...patch
    }: {
      id: string;
      name?: string;
      color?: string;
      target_per_day?: number;
      archived?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("habits")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.habits }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.habits });
      qc.invalidateQueries({ queryKey: qk.habitLogs() });
    },
  });
}

/** Bir gün için alışkanlık sayısını ayarlar. count<=0 ise kayıt silinir. */
export function useSetHabitLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      habit_id: string;
      day: string;
      count: number;
    }) => {
      const user_id = await requireUserId();
      if (input.count <= 0) {
        const { error } = await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", input.habit_id)
          .eq("day", input.day);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("habit_logs")
        .upsert({ ...input, user_id }, { onConflict: "habit_id,day" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.habitLogs() }),
  });
}

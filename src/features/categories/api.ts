import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { requireUserId } from "@/lib/auth-helpers";
import { qk } from "@/lib/query-keys";
import type { Category } from "@/lib/database.types";

export function useCategories() {
  return useQuery({
    queryKey: qk.categories,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export interface CategoryUsage {
  tasks: number;
  goals: number;
  plans: number;
  total: number;
}

/** Bir kategoriye bağlı görev/hedef/plan sayısını döner (silme onayı için). */
export function useCategoryUsage(id: string | null) {
  return useQuery({
    queryKey: id ? qk.categoryUsage(id) : ["categories", "usage", "none"],
    enabled: !!id,
    queryFn: async (): Promise<CategoryUsage> => {
      const countFor = async (table: "tasks" | "goals" | "plans") => {
        const { count, error } = await supabase
          .from(table)
          .select("id", { count: "exact", head: true })
          .eq("category_id", id!);
        if (error) throw error;
        return count ?? 0;
      };
      const [tasks, goals, plans] = await Promise.all([
        countFor("tasks"),
        countFor("goals"),
        countFor("plans"),
      ]);
      return { tasks, goals, plans, total: tasks + goals + plans };
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; color: string }) => {
      const user_id = await requireUserId();
      const { data, error } = await supabase
        .from("categories")
        .insert({ ...input, user_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      color?: string;
    }) => {
      const { id, ...patch } = input;
      const { data, error } = await supabase
        .from("categories")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // İlişkili kayıtlar DB tarafında ON DELETE SET NULL ile "Kategorisiz" olur.
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categories });
      qc.invalidateQueries({ queryKey: qk.tasks() });
      qc.invalidateQueries({ queryKey: qk.goals });
      qc.invalidateQueries({ queryKey: qk.plans() });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { qk } from "@/lib/query-keys";
import type { TimeEntry } from "@/lib/database.types";

/** Tüm zaman kayıtları (çalışma saati grafiklerinin kaynağı). */
export function useTimeEntries() {
  return useQuery({
    queryKey: qk.timeEntries(),
    queryFn: async (): Promise<TimeEntry[]> => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .order("day", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

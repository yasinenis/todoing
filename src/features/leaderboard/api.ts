import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface LeaderboardRow {
  user_id: string;
  username: string | null;
  avatar_path: string | null;
  seconds: number;
}

export function useLeaderboard(period: LeaderboardPeriod) {
  return useQuery({
    queryKey: ["leaderboard", period],
    staleTime: 60_000,
    queryFn: async (): Promise<LeaderboardRow[]> => {
      const { data, error } = await supabase.rpc("leaderboard", { period });
      if (error) throw error;
      return (data ?? []) as LeaderboardRow[];
    },
  });
}

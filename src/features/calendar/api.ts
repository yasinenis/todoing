import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { requireUserId } from "@/lib/auth-helpers";
import { qk } from "@/lib/query-keys";
import type { DayEntry } from "@/lib/database.types";

const BUCKET = "day-photos";

export function useDayEntries() {
  return useQuery({
    queryKey: qk.dayEntries(),
    queryFn: async (): Promise<DayEntry[]> => {
      const { data, error } = await supabase.from("day_entries").select("*");
      if (error) throw error;
      return data;
    },
  });
}

export function useDayEntry(day: string | null) {
  return useQuery({
    queryKey: day ? qk.dayEntry(day) : ["day_entries", "none"],
    enabled: !!day,
    queryFn: async (): Promise<DayEntry | null> => {
      const { data, error } = await supabase
        .from("day_entries")
        .select("*")
        .eq("day", day!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export interface DayEntryInput {
  day: string;
  rating?: number | null;
  mood?: string | null;
  reflection?: string | null;
  photo_path?: string | null;
}

export function useUpsertDayEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DayEntryInput) => {
      const user_id = await requireUserId();
      const { data, error } = await supabase
        .from("day_entries")
        .upsert({ ...input, user_id }, { onConflict: "user_id,day" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: qk.dayEntry(vars.day) });
      qc.invalidateQueries({ queryKey: qk.dayEntries() });
    },
  });
}

/** Günün fotoğrafını Storage'a yükler, depolama yolunu döner. */
export async function uploadDayPhoto(file: File, day: string): Promise<string> {
  const userId = await requireUserId();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${day}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;
  return path;
}

/** Eski fotoğrafı siler (en iyi çaba). */
export async function removeDayPhoto(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path]);
}

/** Birden çok fotoğraf için tek istekte imzalı URL'ler (takvim küçük önizlemeleri). */
export function useSignedPhotoUrls(paths: string[]) {
  const sorted = [...new Set(paths)].sort();
  return useQuery({
    queryKey: ["photo-urls", sorted.join(",")],
    enabled: sorted.length > 0,
    staleTime: 50 * 60 * 1000,
    queryFn: async (): Promise<Map<string, string>> => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(sorted, 3600);
      if (error) throw error;
      const map = new Map<string, string>();
      for (const item of data ?? []) {
        if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
      }
      return map;
    },
  });
}

/** Özel bucket için imzalı görüntüleme URL'i (1 saat). */
export function useSignedPhotoUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["photo-url", path],
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path!, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

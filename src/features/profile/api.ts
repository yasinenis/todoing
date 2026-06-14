import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { requireUserId } from "@/lib/auth-helpers";
import type { Profile } from "@/lib/database.types";

const AVATAR_BUCKET = "avatars";

export const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

/** Geçerli kullanıcının profili. */
export function useMyProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: auth } = await supabase.auth.getUser();
      const id = auth.user?.id;
      if (!id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** Avatar depolama yolundan herkese açık URL üretir. */
export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Kullanıcı adı uygun mu? (kayıt öncesi de çağrılabilir) */
export async function checkUsernameAvailable(name: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("username_available", { name });
  if (error) throw error;
  return Boolean(data);
}

export function useUpdateUsername() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const userId = await requireUserId();
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", userId);
      if (error) {
        if (error.code === "23505")
          throw new Error("Bu kullanıcı adı zaten alınmış.");
        throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
}

/** Avatarı yükler, profili günceller, eski dosyayı siler. */
export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const userId = await requireUserId();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;

      // Eski avatarı bul ve sil (en iyi çaba).
      const { data: prof } = await supabase
        .from("profiles")
        .select("avatar_path")
        .eq("id", userId)
        .maybeSingle();
      const old = prof?.avatar_path;

      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_path: path })
        .eq("id", userId);
      if (updErr) throw updErr;

      if (old && old !== path)
        await supabase.storage.from(AVATAR_BUCKET).remove([old]);

      return path;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", "me"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

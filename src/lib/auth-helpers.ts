import { supabase } from "./supabase";

/**
 * Aktif kullanıcının id'sini döner (yerel oturumdan, ağ çağrısı yok).
 * Insert/update işlemlerinde user_id doldurmak için kullanılır.
 */
export async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yap.");
  return id;
}

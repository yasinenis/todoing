import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Supabase ortam değişkenleri tanımlı mı? Değilse uygulama kurulum ekranı gösterir. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Tek paylaşılan Supabase istemcisi. Ortam değişkenleri yoksa placeholder
 * değerlerle oluşturulur (istemci patlamasın diye); gerçek istekler kurulum
 * tamamlanınca çalışır.
 */
export const supabase = createClient<Database>(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

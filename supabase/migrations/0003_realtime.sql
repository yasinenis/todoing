-- TodoIng — Realtime: timers ve tasks tablolarındaki değişiklikleri canlı yayınla
-- Çalıştırma: Supabase Dashboard > SQL Editor'da çalıştır (bir kez).
-- Böylece bir cihazda sayaç başlat/durdur → diğer cihazda anında yansır.

-- timers: UPDATE'lerde tam satırın gelmesi için replica identity full
alter table public.timers replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'timers'
  ) then
    alter publication supabase_realtime add table public.timers;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;
end $$;

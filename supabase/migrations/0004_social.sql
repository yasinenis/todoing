-- TodoIng — sosyal: kullanıcı adı, profil resmi, liderlik tablosu
-- Çalıştırma: Supabase SQL Editor (0001..0003'ten sonra).

-- =========================================================
-- profiles: username + avatar
-- =========================================================
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists avatar_path text;

-- Benzersiz kullanıcı adı (büyük/küçük harf duyarsız). NULL'lar serbest.
create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

-- RLS: profiller herkes (giriş yapmış) tarafından OKUNABİLİR (liderlik için),
-- ama yalnız sahibi değiştirebilir. (Email burada DEĞİL; auth.users'ta.)
drop policy if exists "profiles_own" on public.profiles;
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_all" on public.profiles
  for select using (true);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Yeni kullanıcıda username'i metadata'dan al (kayıt sırasında gönderilir).
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data->>'username', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- =========================================================
-- Kullanıcı adı uygunluk kontrolü (kayıt öncesi; anon erişebilir)
-- =========================================================
create or replace function public.username_available(name text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(name)
  );
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- =========================================================
-- Liderlik tablosu: döneme göre en çok çalışanlar
-- period: 'daily' | 'weekly' | 'monthly' | 'yearly'
-- =========================================================
create or replace function public.leaderboard(period text)
returns table (
  user_id uuid,
  username text,
  avatar_path text,
  seconds bigint
)
language sql
security definer
set search_path = public
as $$
  select te.user_id,
         p.username,
         p.avatar_path,
         sum(te.duration_seconds)::bigint as seconds
  from public.time_entries te
  join public.profiles p on p.id = te.user_id
  where p.username is not null
    and te.day >= case period
      when 'daily'   then current_date
      when 'weekly'  then date_trunc('week',  current_date)::date
      when 'monthly' then date_trunc('month', current_date)::date
      when 'yearly'  then date_trunc('year',  current_date)::date
      else '1900-01-01'::date
    end
  group by te.user_id, p.username, p.avatar_path
  order by seconds desc
  limit 100;
$$;
grant execute on function public.leaderboard(text) to authenticated;

-- =========================================================
-- avatars bucket (herkese açık okuma — liderlikte görünsün)
-- Yol deseni: <auth.uid()>/<dosya>
-- =========================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_insert" on storage.objects;
create policy "avatars_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update" on storage.objects;
create policy "avatars_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete" on storage.objects;
create policy "avatars_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

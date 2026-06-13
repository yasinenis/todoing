-- TodoIng — başlangıç şeması
-- Çalıştırma: Supabase Dashboard > SQL Editor'a yapıştır ve çalıştır.
-- Notlar:
--   * category_id = NULL  ==> "Kategorisiz" (sanal kategori, ayrı satır yok).
--   * Kategori silinince ON DELETE SET NULL ile bağlı kayıtlar Kategorisiz olur.
--   * Tüm tablolarda RLS açık; kullanıcı yalnız kendi verisine erişir.

-- =========================================================
-- profiles
-- =========================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text,
  theme         text not null default 'system',
  week_starts_on smallint not null default 1,
  created_at    timestamptz not null default now()
);

-- =========================================================
-- categories
-- =========================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  color       text not null default '#a78bfa',
  created_at  timestamptz not null default now()
);
create index if not exists categories_user_idx on public.categories (user_id);

-- =========================================================
-- goals (görevlerden önce; tasks.goal_id buna bakar)
-- =========================================================
create table if not exists public.goals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  title           text not null,
  description     text,
  category_id     uuid references public.categories (id) on delete set null,
  parent_goal_id  uuid references public.goals (id) on delete set null,
  timeframe       text not null check (timeframe in ('daily','weekly','monthly','quarterly','yearly')),
  start_date      date not null default current_date,
  target_date     date not null,
  progress        smallint not null default 0 check (progress between 0 and 100),
  auto_progress   boolean not null default false,
  status          text not null default 'active' check (status in ('active','completed','archived')),
  created_at      timestamptz not null default now()
);
create index if not exists goals_user_idx on public.goals (user_id);
create index if not exists goals_parent_idx on public.goals (parent_goal_id);

-- =========================================================
-- tasks
-- =========================================================
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  title         text not null,
  notes         text,
  category_id   uuid references public.categories (id) on delete set null,
  goal_id       uuid references public.goals (id) on delete set null,
  status        text not null default 'todo' check (status in ('todo','in_progress','done')),
  priority      text not null default 'medium' check (priority in ('low','medium','high')),
  due_date      date,
  planned_date  date,
  total_seconds integer not null default 0,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);
create index if not exists tasks_user_idx on public.tasks (user_id);
create index if not exists tasks_category_idx on public.tasks (category_id);
create index if not exists tasks_goal_idx on public.tasks (goal_id);
create index if not exists tasks_planned_idx on public.tasks (user_id, planned_date);

-- =========================================================
-- time_entries (sayaç oturumları + günlük çalışma saatinin kaynağı)
-- =========================================================
create table if not exists public.time_entries (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  task_id           uuid references public.tasks (id) on delete cascade,
  started_at        timestamptz not null,
  ended_at          timestamptz not null,
  duration_seconds  integer not null,
  day               date not null
);
create index if not exists time_entries_user_day_idx on public.time_entries (user_id, day);
create index if not exists time_entries_task_idx on public.time_entries (task_id);

-- =========================================================
-- timers (kullanıcı başına tek aktif sayaç durumu)
-- =========================================================
create table if not exists public.timers (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users (id) on delete cascade,
  task_id             uuid references public.tasks (id) on delete set null,
  running             boolean not null default false,
  started_at          timestamptz,
  accumulated_seconds integer not null default 0,
  updated_at          timestamptz not null default now()
);

-- =========================================================
-- habits + habit_logs
-- =========================================================
create table if not exists public.habits (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  color           text not null default '#34d399',
  target_per_day  smallint not null default 1,
  archived        boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists habits_user_idx on public.habits (user_id);

create table if not exists public.habit_logs (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users (id) on delete cascade,
  habit_id  uuid not null references public.habits (id) on delete cascade,
  day       date not null,
  count     smallint not null default 1,
  unique (habit_id, day)
);
create index if not exists habit_logs_user_idx on public.habit_logs (user_id, day);

-- =========================================================
-- plans (dönemsel planlar — takvime yerleşir)
-- =========================================================
create table if not exists public.plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  notes       text,
  category_id uuid references public.categories (id) on delete set null,
  period      text not null check (period in ('1d','3d','1w','1m','1y')),
  start_date  date not null,
  end_date    date not null,
  created_at  timestamptz not null default now()
);
create index if not exists plans_user_idx on public.plans (user_id, start_date);

-- =========================================================
-- day_entries (günlük değerlendirme + günün fotoğrafı)
-- =========================================================
create table if not exists public.day_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  day         date not null,
  rating      smallint check (rating between 1 and 5),
  mood        text,
  reflection  text,
  photo_path  text,
  created_at  timestamptz not null default now(),
  unique (user_id, day)
);
create index if not exists day_entries_user_idx on public.day_entries (user_id, day);

-- =========================================================
-- tasks.total_seconds'i time_entries değişiminde güncel tut
-- =========================================================
create or replace function public.recalc_task_total() returns trigger as $$
declare
  affected uuid := coalesce(new.task_id, old.task_id);
begin
  if affected is not null then
    update public.tasks t
       set total_seconds = coalesce((
         select sum(te.duration_seconds)::int
           from public.time_entries te
          where te.task_id = affected
       ), 0)
     where t.id = affected;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_recalc_task_total on public.time_entries;
create trigger trg_recalc_task_total
  after insert or update or delete on public.time_entries
  for each row execute function public.recalc_task_total();

-- =========================================================
-- Yeni kullanıcı için otomatik profil oluştur
-- =========================================================
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.goals       enable row level security;
alter table public.tasks       enable row level security;
alter table public.time_entries enable row level security;
alter table public.timers      enable row level security;
alter table public.habits      enable row level security;
alter table public.habit_logs  enable row level security;
alter table public.plans       enable row level security;
alter table public.day_entries enable row level security;

-- profiles: id = auth.uid()
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Diğer tüm tablolar: user_id = auth.uid()
do $$
declare t text;
begin
  foreach t in array array[
    'categories','goals','tasks','time_entries','timers',
    'habits','habit_logs','plans','day_entries'
  ] loop
    execute format('drop policy if exists %I on public.%I;', t || '_own', t);
    execute format(
      'create policy %I on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t || '_own', t
    );
  end loop;
end $$;

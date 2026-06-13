-- TodoIng — gün fotoğrafları için Storage bucket'ı ve politikaları
-- Çalıştırma: 0001_init.sql'den sonra SQL Editor'da çalıştır.
-- Dosya yolu deseni: <auth.uid()>/<dosya-adı>  → her kullanıcı yalnız kendi
-- klasörüne erişir.

insert into storage.buckets (id, name, public)
values ('day-photos', 'day-photos', false)
on conflict (id) do nothing;

drop policy if exists "day_photos_select" on storage.objects;
create policy "day_photos_select" on storage.objects
  for select using (
    bucket_id = 'day-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "day_photos_insert" on storage.objects;
create policy "day_photos_insert" on storage.objects
  for insert with check (
    bucket_id = 'day-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "day_photos_update" on storage.objects;
create policy "day_photos_update" on storage.objects
  for update using (
    bucket_id = 'day-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "day_photos_delete" on storage.objects;
create policy "day_photos_delete" on storage.objects
  for delete using (
    bucket_id = 'day-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

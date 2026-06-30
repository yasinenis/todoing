-- =========================================================
-- Odak puanı: her sayaç oturumuna (time_entries) 0-10 arası
-- "derse odaklanma" puanı (opsiyonel; atlanabilir → null).
-- =========================================================
alter table public.time_entries
  add column if not exists focus_score smallint
  check (focus_score is null or (focus_score between 0 and 10));

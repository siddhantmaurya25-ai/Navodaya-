create table if not exists public.navodaya_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  save jsonb not null check (jsonb_typeof(save) = 'object'),
  version bigint not null default 1 check (version > 0),
  updated_at timestamptz not null default pg_catalog.now()
);

alter table public.navodaya_progress enable row level security;
revoke all on table public.navodaya_progress from anon, authenticated;
grant select on table public.navodaya_progress to authenticated;
grant insert (user_id, save) on table public.navodaya_progress to authenticated;
grant update (save) on table public.navodaya_progress to authenticated;

drop policy if exists navodaya_progress_select_own on public.navodaya_progress;
drop policy if exists navodaya_progress_insert_own on public.navodaya_progress;
drop policy if exists navodaya_progress_update_own on public.navodaya_progress;

create policy navodaya_progress_select_own
  on public.navodaya_progress for select to authenticated
  using ((select auth.uid()) = user_id);

create policy navodaya_progress_insert_own
  on public.navodaya_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy navodaya_progress_update_own
  on public.navodaya_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.touch_navodaya_progress()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  if tg_op = 'UPDATE' then
    new.version := old.version + 1;
  end if;
  return new;
end;
$$;

revoke all on function public.touch_navodaya_progress() from public, anon, authenticated;

drop trigger if exists navodaya_progress_touch on public.navodaya_progress;
create trigger navodaya_progress_touch
  before update on public.navodaya_progress
  for each row execute function public.touch_navodaya_progress();

-- Mundialistas: tabla donde se guarda el equipo de cada cuenta.
-- Pegá todo esto en Supabase → SQL Editor → New query → Run.

create table if not exists public.partidas (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb,
  updated_at timestamptz not null default now()
);

-- Cada persona sólo puede ver y cambiar SU partida.
alter table public.partidas enable row level security;

drop policy if exists "ver mi partida" on public.partidas;
drop policy if exists "crear mi partida" on public.partidas;
drop policy if exists "cambiar mi partida" on public.partidas;
drop policy if exists "borrar mi partida" on public.partidas;

create policy "ver mi partida"     on public.partidas for select using (auth.uid() = user_id);
create policy "crear mi partida"   on public.partidas for insert with check (auth.uid() = user_id);
create policy "cambiar mi partida" on public.partidas for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "borrar mi partida"  on public.partidas for delete using (auth.uid() = user_id);

-- Sky Team online: server-authoritative game state on Supabase Postgres.
-- Re-runnable: this script fully resets the 3 game tables and reschedules cron.
-- Architecture is game-agnostic; everything game-specific lives in `state` jsonb.

-- 1. Extensions ------------------------------------------------------------
create extension if not exists pgcrypto;
create extension if not exists pg_cron;

-- 2. Full reset (idempotent) ----------------------------------------------
-- Unschedule the cleanup job if it already exists (ignore if missing).
do $$
begin
  perform cron.unschedule('skyteam_cleanup');
exception
  when others then null;
end $$;

drop table if exists public.game_events cascade;
drop table if exists public.game_players cascade;
drop table if exists public.games cascade;

-- 3. Tables ----------------------------------------------------------------
-- One row per game. `state` holds the FULL server-only game state (incl. hidden
-- dice). Clients never read this directly; they fetch a redacted view via a
-- server action using the service_role key.
create table public.games (
  id           uuid primary key default gen_random_uuid(),
  room_code    text not null unique,
  game_type    text not null default 'skyteam',
  status       text not null default 'lobby', -- lobby | playing | finished
  settings     jsonb not null default '{}'::jsonb,
  state        jsonb not null default '{}'::jsonb,
  version      integer not null default 0,
  host_user_id uuid,
  created_at   timestamptz not null default now()
);
create index games_game_type_idx on public.games (game_type);
create index games_status_idx on public.games (status);

-- Who occupies which seat. Sky Team is a 2-player co-op: seats 0 and 1.
create table public.game_players (
  id           uuid primary key default gen_random_uuid(),
  game_id      uuid not null references public.games (id) on delete cascade,
  seat         smallint not null check (seat between 0 and 1),
  user_id      uuid,
  display_name text,
  is_bot       boolean not null default false,
  role         text, -- 'pilot' | 'copilot'
  connected    boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (game_id, seat)
);
create index game_players_game_id_idx on public.game_players (game_id);
create index game_players_user_id_idx on public.game_players (user_id);

-- Append-only realtime tick. Carries NO secret: only a version bump. Clients
-- subscribe and refetch their redacted view whenever a new tick lands.
create table public.game_events (
  id         bigint generated always as identity primary key,
  game_id    uuid not null references public.games (id) on delete cascade,
  version    integer not null,
  created_at timestamptz not null default now()
);
create index game_events_game_id_idx on public.game_events (game_id);

-- 4. Row Level Security ----------------------------------------------------
-- games + game_players: RLS on, NO policy => only service_role can read/write.
alter table public.games enable row level security;
alter table public.game_players enable row level security;

-- game_events: RLS on, readable by any authenticated user (incl. anonymous).
alter table public.game_events enable row level security;
create policy game_events_select_authenticated
  on public.game_events
  for select
  to authenticated
  using (true);

-- Add the tick table to the realtime publication (re-runnable safe).
do $$
begin
  alter publication supabase_realtime add table public.game_events;
exception
  when duplicate_object then null;
end $$;

-- 5. Cleanup cron ----------------------------------------------------------
-- Drop games older than 1 day (cascades to players + events).
select cron.schedule(
  'skyteam_cleanup',
  '0 * * * *',
  $$delete from public.games where created_at < now() - interval '1 day'$$
);

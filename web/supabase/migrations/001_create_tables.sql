-- 001_create_tables.sql
-- Schema for The Silk Throne interactive fiction game

-- ============================================================
-- TABLES
-- ============================================================

create table public.games (
  id              uuid        primary key default gen_random_uuid(),
  slug            text        unique not null,
  title           text        not null,
  tagline         text,
  description     text,
  long_description text,
  cover_image_url text,
  price_inr       integer     not null default 0,   -- in paise
  price_usd       integer     not null default 0,   -- in cents
  genre           text,
  word_count      integer,
  scene_list      text[]      not null default '{}',
  free_scene_list text[]      not null default '{}',
  is_published    boolean     not null default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table public.purchases (
  id                  uuid    primary key default gen_random_uuid(),
  user_id             uuid    not null references auth.users(id) on delete cascade,
  game_id             uuid    not null references public.games(id) on delete cascade,
  razorpay_payment_id text,
  razorpay_order_id   text,
  amount_paise        integer not null default 0,
  currency            text    not null default 'INR',
  status              text    not null default 'pending',
  created_at          timestamptz default now(),

  unique (user_id, game_id)
);

create table public.save_data (
  id              uuid    primary key default gen_random_uuid(),
  user_id         uuid    not null references auth.users(id) on delete cascade,
  game_id         uuid    not null references public.games(id) on delete cascade,
  slot_name       text    not null default 'auto',
  current_scene   text    not null,
  variables       jsonb   not null default '{}',
  choice_history  jsonb   not null default '[]',
  saved_at        timestamptz default now(),

  unique (user_id, game_id, slot_name)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_purchases_user_game on public.purchases (user_id, game_id);
create index idx_save_data_user_game on public.save_data  (user_id, game_id);

-- ============================================================
-- UPDATED_AT TRIGGER FOR GAMES
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_games_updated_at
  before update on public.games
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.games     enable row level security;
alter table public.purchases enable row level security;
alter table public.save_data enable row level security;

-- games: anyone can read published games
create policy "Public can view published games"
  on public.games
  for select
  using (is_published = true);

-- games: service role has full access (bypasses RLS by default,
-- but an explicit policy makes intent clear for dashboard queries)
create policy "Service role has full access to games"
  on public.games
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- purchases: authenticated users can read their own purchases
create policy "Users can view own purchases"
  on public.purchases
  for select
  to authenticated
  using (user_id = auth.uid());

-- purchases: authenticated users can create their own purchases
create policy "Users can create own purchases"
  on public.purchases
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- save_data: authenticated users have full control over their own saves
create policy "Users can view own saves"
  on public.save_data
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create own saves"
  on public.save_data
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own saves"
  on public.save_data
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own saves"
  on public.save_data
  for delete
  to authenticated
  using (user_id = auth.uid());

-- date_sessions: one row per AI date-generation event for a logged-in user
create table if not exists date_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  partner_name  text not null default 'Anonymous',
  suggestions   jsonb not null default '[]',
  created_at    timestamptz not null default now()
);

create index if not exists date_sessions_user_id_idx on date_sessions (user_id);

alter table date_sessions enable row level security;

create policy "Users can insert own sessions"
  on date_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can read own sessions"
  on date_sessions for select
  using (auth.uid() = user_id);

-- date_ratings: one rating row per suggestion within a session
create table if not exists date_ratings (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references date_sessions(id) on delete cascade,
  activity_title text not null,
  rating         smallint not null check (rating between 1 and 5),
  created_at     timestamptz not null default now(),
  unique(session_id, activity_title)
);

alter table date_ratings enable row level security;

create policy "Users can manage own ratings"
  on date_ratings for all
  using (
    session_id in (select id from date_sessions where user_id = auth.uid())
  )
  with check (
    session_id in (select id from date_sessions where user_id = auth.uid())
  );

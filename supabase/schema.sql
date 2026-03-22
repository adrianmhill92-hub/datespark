-- DateSpark profiles table
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  date_code   char(6) not null unique,
  name        text not null,
  age         smallint,
  city        text not null,
  interests   text[] not null default '{}',
  vibes       text[] not null default '{}',
  budget      text not null default 'medium',
  zip_code    text,
  travel_miles text not null default '25',
  notes       text,
  created_at  timestamptz not null default now()
);

-- Index for fast lookups by date_code
create index if not exists profiles_date_code_idx on profiles (date_code);

-- Row Level Security: allow anyone to insert/select (anonymous use)
alter table profiles enable row level security;

create policy "Anyone can insert a profile"
  on profiles for insert
  with check (true);

create policy "Anyone can read profiles by date_code"
  on profiles for select
  using (true);

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  currency text default 'BRL',
  monthly_income numeric(12,2),
  financial_goal text,
  lifestyle_level int default 3 check (lifestyle_level between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ACCOUNTS
-- ============================================================
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('checking','savings','investment','credit','cash','wallet')),
  currency text default 'BRL',
  balance numeric(12,2) default 0,
  color text,
  icon text,
  is_active boolean default true,
  include_in_net_worth boolean default true,
  created_at timestamptz default now()
);

alter table public.accounts enable row level security;

create policy "Users can manage own accounts"
  on public.accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income','expense')),
  icon text,
  color text,
  parent_id uuid references public.categories(id),
  is_system boolean default false,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "Users can manage own categories"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete cascade not null,
  category_id uuid references public.categories(id),
  type text not null check (type in ('income','expense','transfer')),
  amount numeric(12,2) not null check (amount > 0),
  description text not null,
  notes text,
  date date not null,
  is_recurring boolean default false,
  recurring_rule jsonb,
  tags text[],
  attachment_url text,
  is_confirmed boolean default true,
  transfer_pair_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index transactions_user_id_date_idx on public.transactions(user_id, date desc);
create index transactions_category_id_idx on public.transactions(category_id);
create index transactions_account_id_idx on public.transactions(account_id);

alter table public.transactions enable row level security;

create policy "Users can manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- FINANCIAL GOALS
-- ============================================================
create table public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) default 0,
  target_date date,
  category text check (category in ('emergency','investment','purchase','travel','education','other')),
  icon text,
  color text,
  is_completed boolean default false,
  created_at timestamptz default now()
);

alter table public.financial_goals enable row level security;

create policy "Users can manage own goals"
  on public.financial_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- AI INSIGHTS
-- ============================================================
create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('monthly_report','pain_points','suggestions','health_score','chat')),
  period text,
  content jsonb not null,
  generated_at timestamptz default now(),
  expires_at timestamptz,
  token_count int
);

create index ai_insights_user_type_idx on public.ai_insights(user_id, type, period);

alter table public.ai_insights enable row level security;

create policy "Users can manage own insights"
  on public.ai_insights for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- AI CONVERSATIONS
-- ============================================================
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  messages jsonb[] default array[]::jsonb[],
  context_snapshot jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ai_conversations enable row level security;

create policy "Users can manage own conversations"
  on public.ai_conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- EXCHANGE RATES
-- ============================================================
create table public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  from_currency text not null,
  to_currency text not null,
  rate numeric(10,6) not null,
  date date not null,
  source text default 'api',
  unique(from_currency, to_currency, date)
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_transactions
  before update on public.transactions
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_conversations
  before update on public.ai_conversations
  for each row execute procedure public.set_updated_at();

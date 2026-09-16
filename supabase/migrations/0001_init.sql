-- BioClock 初始表结构（Supabase Postgres）
-- 所有表启用 RLS，用户仅能读写自己的数据

-- 用户基础信息（onboarding 步骤①）
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  birth_date date not null,
  gender text not null check (gender in ('male', 'female')),
  height_cm numeric(5, 1) not null,
  weight_kg numeric(5, 1) not null,
  goal text not null check (goal in ('understand', 'improve', 'prevent')),
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

-- 生理年龄测量记录（dimensions 存五维结果 jsonb）
create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('quick', 'standard', 'deep')),
  bio_age numeric(4, 1) not null,
  calendar_age numeric(4, 1) not null,
  delta numeric(4, 1) not null,
  confidence numeric(3, 1) not null,
  dimensions jsonb not null,
  algorithm_version text not null default 'v1.0-simplified',
  created_at timestamptz not null default now()
);

-- 每日行为打卡（unique：同日同行为仅一条，用于打卡/取消切换）
create table if not exists public.behavior_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  behavior_key text not null,
  direction smallint not null check (direction in (1, -1)),
  score smallint not null,
  source text not null default 'manual' check (source in ('manual', 'auto')),
  created_at timestamptz not null default now(),
  unique (user_id, log_date, behavior_key)
);

-- 每日结算
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  positive_total smallint not null default 0,
  negative_total smallint not null default 0,
  net_value smallint not null default 0,
  predicted_age numeric(4, 1),
  unique (user_id, log_date)
);

-- 干预计划（behaviors 为行为 key 数组 jsonb，最多 3 个）
create table if not exists public.intervention_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  behaviors jsonb not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  started_at timestamptz not null default now()
);

-- 徽章
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_key)
);

create index if not exists measurements_user_created_idx
  on public.measurements (user_id, created_at desc);
create index if not exists behavior_logs_user_date_idx
  on public.behavior_logs (user_id, log_date);
create index if not exists daily_logs_user_date_idx
  on public.daily_logs (user_id, log_date);

-- RLS 策略
alter table public.profiles enable row level security;
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

alter table public.measurements enable row level security;
create policy "measurements: select own" on public.measurements
  for select using (auth.uid() = user_id);
create policy "measurements: insert own" on public.measurements
  for insert with check (auth.uid() = user_id);

alter table public.behavior_logs enable row level security;
create policy "behavior_logs: select own" on public.behavior_logs
  for select using (auth.uid() = user_id);
create policy "behavior_logs: insert own" on public.behavior_logs
  for insert with check (auth.uid() = user_id);
create policy "behavior_logs: delete own" on public.behavior_logs
  for delete using (auth.uid() = user_id);

alter table public.daily_logs enable row level security;
create policy "daily_logs: select own" on public.daily_logs
  for select using (auth.uid() = user_id);
create policy "daily_logs: insert own" on public.daily_logs
  for insert with check (auth.uid() = user_id);
create policy "daily_logs: update own" on public.daily_logs
  for update using (auth.uid() = user_id);

alter table public.intervention_plans enable row level security;
create policy "plans: select own" on public.intervention_plans
  for select using (auth.uid() = user_id);
create policy "plans: insert own" on public.intervention_plans
  for insert with check (auth.uid() = user_id);
create policy "plans: update own" on public.intervention_plans
  for update using (auth.uid() = user_id);

alter table public.user_badges enable row level security;
create policy "badges: select own" on public.user_badges
  for select using (auth.uid() = user_id);
create policy "badges: insert own" on public.user_badges
  for insert with check (auth.uid() = user_id);

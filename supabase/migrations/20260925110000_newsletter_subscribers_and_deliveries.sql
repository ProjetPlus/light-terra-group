create extension if not exists pgcrypto;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  status text not null default 'active' check (status in ('active','unsubscribed')),
  source text not null default 'website',
  welcome_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

create table if not exists public.newsletter_deliveries (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.newsletter_subscribers(id) on delete cascade,
  news_id uuid not null references public.news(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique (subscriber_id, news_id)
);

alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_deliveries enable row level security;

drop policy if exists "public can create newsletter subscriber" on public.newsletter_subscribers;
create policy "public can create newsletter subscriber" on public.newsletter_subscribers for insert to anon, authenticated
with check (length(trim(full_name)) between 2 and 120 and length(trim(phone)) between 6 and 40 and length(lower(trim(email))) between 5 and 254 and status='active' and source='website');

drop policy if exists "admins can read newsletter subscribers" on public.newsletter_subscribers;
create policy "admins can read newsletter subscribers" on public.newsletter_subscribers for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role='admin'));

drop policy if exists "admins can update newsletter subscribers" on public.newsletter_subscribers;
create policy "admins can update newsletter subscribers" on public.newsletter_subscribers for update to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role='admin'))
with check (exists (select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role='admin'));

drop policy if exists "admins can read newsletter deliveries" on public.newsletter_deliveries;
create policy "admins can read newsletter deliveries" on public.newsletter_deliveries for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role='admin'));

create index if not exists newsletter_subscribers_status_idx on public.newsletter_subscribers(status);
create index if not exists newsletter_subscribers_created_at_idx on public.newsletter_subscribers(created_at desc);
create index if not exists newsletter_deliveries_news_idx on public.newsletter_deliveries(news_id);

create or replace function public.touch_newsletter_subscriber()
returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;

drop trigger if exists newsletter_subscriber_touch on public.newsletter_subscribers;
create trigger newsletter_subscriber_touch before update on public.newsletter_subscribers
for each row execute function public.touch_newsletter_subscriber();
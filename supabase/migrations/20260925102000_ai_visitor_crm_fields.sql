-- AI visitor CRM fields and server-side persistence hardening
alter table public.ai_visitors
  add column if not exists status text not null default 'new',
  add column if not exists notes text,
  add column if not exists desired_date text,
  add column if not exists budget_range text,
  add column if not exists consent_contact boolean not null default false;

alter table public.ai_conversations
  add column if not exists summary text;

create index if not exists idx_ai_visitors_status on public.ai_visitors(status);
create index if not exists idx_ai_visitors_last_seen on public.ai_visitors(last_seen_at desc);

drop policy if exists "public can update own ai visitor" on public.ai_visitors;
drop policy if exists "public can update ai conversation" on public.ai_conversations;
drop policy if exists "public can create ai visitor" on public.ai_visitors;
drop policy if exists "public can create ai conversation" on public.ai_conversations;
drop policy if exists "public can create ai messages" on public.ai_conversation_messages;

-- The website assistant writes with the server-side Supabase service role.
-- Visitors and conversations remain readable only by authenticated admins through the existing policies.

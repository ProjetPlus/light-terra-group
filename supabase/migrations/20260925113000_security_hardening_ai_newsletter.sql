-- Security hardening applied to production on 2026-09-25.
create or replace function public.touch_newsletter_subscriber()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop policy if exists "admins read ai visitors" on public.ai_visitors;
create policy "admins read ai visitors" on public.ai_visitors
for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'));

drop policy if exists "admins read ai conversations" on public.ai_conversations;
create policy "admins read ai conversations" on public.ai_conversations
for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'));

drop policy if exists "admins read ai messages" on public.ai_conversation_messages;
create policy "admins read ai messages" on public.ai_conversation_messages
for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'));

drop policy if exists "admins can read newsletter subscribers" on public.newsletter_subscribers;
create policy "admins can read newsletter subscribers" on public.newsletter_subscribers
for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'));

drop policy if exists "admins can update newsletter subscribers" on public.newsletter_subscribers;
create policy "admins can update newsletter subscribers" on public.newsletter_subscribers
for update to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'))
with check (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'));

drop policy if exists "admins can read newsletter deliveries" on public.newsletter_deliveries;
create policy "admins can read newsletter deliveries" on public.newsletter_deliveries
for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'));

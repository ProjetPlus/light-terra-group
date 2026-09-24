-- Public read access for content that is intentionally published/active.
-- Admin writes remain protected by the existing user_roles/app_role policies.
drop policy if exists "Public can read active media items" on public.media_items;
create policy "Public can read active media items"
on public.media_items
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active intro videos" on public.intro_videos;
create policy "Public can read active intro videos"
on public.intro_videos
for select
to anon, authenticated
using (is_active = true);

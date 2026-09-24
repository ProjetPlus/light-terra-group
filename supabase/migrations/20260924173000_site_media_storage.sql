-- Public media bucket: anyone can read published site assets, only administrators can manage them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  52428800,
  array[
    'image/jpeg','image/png','image/webp','image/gif','image/svg+xml',
    'video/mp4','video/webm','video/quicktime'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site media public read" on storage.objects;
create policy "site media public read"
on storage.objects
for select
to public
using (bucket_id = 'site-media');

drop policy if exists "site media admin insert" on storage.objects;
create policy "site media admin insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'::public.app_role
  )
);

drop policy if exists "site media admin update" on storage.objects;
create policy "site media admin update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'::public.app_role
  )
)
with check (
  bucket_id = 'site-media'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'::public.app_role
  )
);

drop policy if exists "site media admin delete" on storage.objects;
create policy "site media admin delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'::public.app_role
  )
);
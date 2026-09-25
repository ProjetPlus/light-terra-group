alter table public.projects add column if not exists cover_image_url text;
alter table public.news add column if not exists cover_image_url text;
update public.news set cover_image_url = coalesce(cover_image_url, image_url) where cover_image_url is null;
update public.projects set cover_image_url = coalesce(cover_image_url, image_url) where cover_image_url is null;

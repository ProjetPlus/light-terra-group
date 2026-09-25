alter table public.company_info
  add column if not exists logo_png_url text,
  add column if not exists logo_jpg_url text;

update public.company_info
set logo_png_url = coalesce(logo_png_url, logo_url),
    logo_jpg_url = coalesce(logo_jpg_url, logo_url)
where logo_png_url is null or logo_jpg_url is null;

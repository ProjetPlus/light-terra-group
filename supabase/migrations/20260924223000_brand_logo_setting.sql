alter table public.company_info
  add column if not exists logo_url text;

update public.company_info
set logo_url = '/media/logo-light-terra-transparent.png'
where logo_url is null;

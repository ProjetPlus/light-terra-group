alter table public.intro_videos
  add column if not exists placement text not null default 'hero_intro',
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists cta_label text,
  add column if not exists cta_url text;

update public.intro_videos
set placement = 'hero_intro'
where placement is null;

alter table public.intro_videos
  drop constraint if exists intro_videos_placement_check;

alter table public.intro_videos
  add constraint intro_videos_placement_check
  check (placement in ('hero_intro','home_showcase'));

create index if not exists intro_videos_public_placement_idx
on public.intro_videos (placement, position)
where is_active = true;

-- Seed the initial public Light Terra Group content so a fresh environment is not empty.
insert into public.projects
  (slug,title,summary,content,image_url,category,location,status,is_featured,is_published,position)
values
  ('dabou-20-lots-titre-foncier',
   'Dabou — 20 lots avec titre foncier',
   'Opportunité foncière présentée par LIGHT TERRA GROUP : 20 lots avec titre foncier.',
   'Découvrez en vidéo cette opportunité à Dabou. Les informations détaillées, la disponibilité et les conditions sont à confirmer avec LIGHT TERRA GROUP.',
   '/media/hero2.jpg','Aménagement foncier','Dabou','a_venir',true,true,1),
  ('assini-opportunite-ile',
   'Assini — une opportunité au cœur de l’île',
   'Présentation d’une opportunité située au cœur de l’île d’Assini.',
   'Une présentation immersive de l’opportunité à Assini. Contactez LIGHT TERRA GROUP pour obtenir les informations disponibles et organiser un échange.',
   '/media/hero4.jpg','Aménagement foncier','Assini','a_venir',true,true,2)
on conflict (slug) do update set
  title=excluded.title, summary=excluded.summary, content=excluded.content,
  image_url=excluded.image_url, category=excluded.category, location=excluded.location,
  status=excluded.status, is_featured=excluded.is_featured, is_published=excluded.is_published,
  position=excluded.position;

insert into public.news
  (slug,title,excerpt,content,image_url,author,published_at,is_published)
values
  ('dabou-20-lots-titre-foncier',
   'Dabou : 20 lots avec titre foncier',
   'Découvrez la présentation vidéo de cette opportunité foncière à Dabou.',
   'LIGHT TERRA GROUP présente une opportunité de 20 lots avec titre foncier à Dabou. Pour les informations de disponibilité et les conditions, contactez directement l’équipe.',
   '/media/hero2.jpg','LT Group',now(),true),
  ('assini-opportunite-ile',
   'Assini : une opportunité au cœur de l’île',
   'Une présentation immersive de l’opportunité à Assini.',
   'Découvrez la présentation de cette opportunité à Assini et échangez avec LIGHT TERRA GROUP pour obtenir les informations disponibles.',
   '/media/hero4.jpg','LT Group',now(),true),
  ('light-terra-group-services',
   'LIGHT TERRA GROUP : nos projets, nos services et notre vision',
   'Un groupe dédié à l’aménagement foncier, au BTP & VRD, à l’immobilier, à l’hydraulique et à l’électrification.',
   'LIGHT TERRA GROUP développe une approche intégrée autour de l’aménagement foncier, du BTP & VRD, de l’immobilier, de l’hydraulique, de l’électrification et des études techniques.',
   '/media/hero1.jpg','LT Group',now(),true)
on conflict (slug) do update set
  title=excluded.title, excerpt=excluded.excerpt, content=excluded.content,
  image_url=excluded.image_url, author=excluded.author, published_at=excluded.published_at,
  is_published=excluded.is_published;

insert into public.media_items (kind,title,description,url,position,is_active)
select * from (
  values
    ('photo','LIGHT TERRA GROUP — identité','Visuel institutionnel.', '/media/hero1.jpg',1,true),
    ('photo','Aménagement foncier','Visuel de présentation.', '/media/hero2.jpg',2,true),
    ('photo','BTP & VRD','Visuel de présentation.', '/media/hero3.jpg',3,true),
    ('photo','Immobilier & infrastructures','Visuel de présentation.', '/media/hero4.jpg',4,true),
    ('video','Présentation','Vidéo d’introduction fournie pour le Hero.', '/media/intro-1.mp4',5,true),
    ('video','Identité LIGHT TERRA GROUP','Animation du logo officiel.', '/media/intro-2.mp4',6,true)
) v(kind,title,description,url,position,is_active)
where not exists (select 1 from public.media_items m where m.url = v.url);

update public.activities set image_url='/media/hero2.jpg' where slug='amenagement-foncier' and image_url is null;
update public.activities set image_url='/media/hero3.jpg' where slug='btp-vrd' and image_url is null;
update public.activities set image_url='/media/hero4.jpg' where slug='immobilier' and image_url is null;
update public.activities set image_url='/media/hero3.jpg' where slug='hydraulique' and image_url is null;
update public.activities set image_url='/media/hero1.jpg' where slug='electrification' and image_url is null;
update public.activities set image_url='/media/hero2.jpg' where slug='topographie-et-etudes' and image_url is null;
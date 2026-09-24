-- Seed the core Light Terra Group public content.
insert into public.company_info
  (name,slogan,description,phone_primary,phone_secondary,whatsapp,email,address,city,country,website)
select
  'LIGHT TERRA GROUP',
  'Bâtir la terre, éclairer l’avenir',
  'LIGHT TERRA GROUP accompagne des projets d’aménagement foncier, de BTP & VRD, d’immobilier, d’hydraulique, d’électrification et d’études techniques.',
  '+225 07 49 22 47 22',
  '+225 07 07 74 14 84',
  '+225 07 49 22 47 22',
  'contact@lightterragroup.com',
  'Abidjan Cocody Akouédo extension sud-est, Lot 637, îlot 60 ; 01 BP 2259 Abidjan 01',
  'Abidjan',
  'Côte d’Ivoire',
  'https://lightterragroup.com'
where not exists (select 1 from public.company_info);

insert into public.activities (slug,title,short_description,description,icon,image_url,position,is_active)
select * from (
  values
  ('amenagement-foncier','Aménagement foncier','Identification, sécurisation et valorisation des opportunités foncières.','Accompagnement des opérations d’aménagement foncier, de l’identification des opportunités aux études et à la structuration des projets.','compass','/media/hero2.jpg',1,true),
  ('btp-vrd','BTP & VRD','Travaux de bâtiment, voirie et réseaux divers.','Conception et accompagnement de projets de bâtiment, voirie et réseaux divers.','hard-hat','/media/hero3.jpg',2,true),
  ('immobilier','Immobilier','Développement et accompagnement de projets immobiliers.','Développement et accompagnement d’opérations immobilières adaptées aux besoins des territoires.','building','/media/hero4.jpg',3,true),
  ('hydraulique','Hydraulique','Infrastructures hydrauliques et adduction d’eau potable.','Études et accompagnement de solutions hydrauliques et d’adduction d’eau potable.','zap','/media/hero3.jpg',4,true),
  ('electrification','Électrification','Infrastructures et solutions d’électrification.','Accompagnement de projets d’électrification et d’infrastructures associées.','zap','/media/hero1.jpg',5,true),
  ('topographie-et-etudes','Topographie & études','Études techniques et accompagnement des projets.','Études techniques et topographiques nécessaires à la préparation et au suivi des projets.','compass','/media/hero2.jpg',6,true)
) v(slug,title,short_description,description,icon,image_url,position,is_active)
where not exists (select 1 from public.activities a where a.slug=v.slug);

insert into public.hero_slides (title,subtitle,image_url,cta_label,cta_url,duration_ms,position,is_active)
select * from (
  values
  ('LIGHT TERRA GROUP','Bâtir la terre, éclairer l’avenir.','/media/hero1.jpg','Découvrir nos services','/services',6000,1,true),
  ('Aménagement foncier & études','Identifier, structurer et valoriser les opportunités foncières.','/media/hero2.jpg','Voir nos activités','/activites',6000,2,true),
  ('BTP & VRD','Des solutions intégrées pour les territoires et leurs infrastructures.','/media/hero3.jpg','Découvrir nos services','/services',6000,3,true),
  ('Immobilier & infrastructures','Accompagner des projets utiles, structurés et durables.','/media/hero4.jpg','Voir nos projets','/projets',6000,4,true)
) v(title,subtitle,image_url,cta_label,cta_url,duration_ms,position,is_active)
where not exists (select 1 from public.hero_slides h where h.image_url=v.image_url);

insert into public.ai_knowledge (question,answer,position,is_active)
select * from (
  values
  ('Que fait LIGHT TERRA GROUP ?','LIGHT TERRA GROUP intervient dans l’aménagement foncier, le BTP & VRD, l’immobilier, l’hydraulique, l’électrification et les études techniques.',1,true),
  ('Comment demander un devis ?','Utilisez le formulaire de contact et de demande de devis du site ou contactez directement LIGHT TERRA GROUP par téléphone ou WhatsApp.',2,true),
  ('Comment contacter LIGHT TERRA GROUP ?','Vous pouvez contacter LIGHT TERRA GROUP au +225 07 49 22 47 22, au +225 07 07 74 14 84 ou par e-mail à contact@lightterragroup.com.',3,true)
) v(question,answer,position,is_active)
where not exists (select 1 from public.ai_knowledge k where k.question=v.question);

insert into public.intro_videos (label,video_url,position,is_active,placement,title,description)
select * from (
  values
  ('Présentation','/media/intro-1.mp4',1,true,'hero_intro','Découvrez nos projets, nos services et notre vision','Séquence d’introduction fournie pour l’ouverture du site.'),
  ('Identité','/media/intro-2.mp4',2,true,'hero_intro','LIGHT TERRA GROUP','Animation du logo officiel LIGHT TERRA GROUP.')
) v(label,video_url,position,is_active,placement,title,description)
where not exists (select 1 from public.intro_videos i where i.video_url=v.video_url);
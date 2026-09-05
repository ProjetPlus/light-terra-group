INSERT INTO public.hero_slides (title, subtitle, image_url, cta_label, cta_url, duration_ms, position) VALUES
('Valoriser la terre', 'Aménagement foncier, études techniques et lotissements maîtrisés.', '/__l5e/assets-v1/cb472e17-7650-4789-95e4-28164cabda4b/hero1.jpg', 'Nos activités', '/activites', 5000, 1),
('Bâtir avec exigence', 'BTP, VRD et travaux publics conduits avec rigueur et qualité.', '/__l5e/assets-v1/25d68820-649c-4bd2-8d50-4dfbf6e88881/hero2.jpg', 'Nos projets', '/projets', 5000, 2),
('Habiter demain', 'Promotion, construction et commercialisation immobilière.', '/__l5e/assets-v1/e4e6a769-2cdd-46a3-8b5f-362e6530ee0b/hero3.jpg', 'Nos services', '/services', 5000, 3),
('Éclairer l''avenir', 'Eau potable, électrification et infrastructures essentielles.', '/__l5e/assets-v1/85fbb32b-5308-4897-bd90-7dfbabfa7df5/hero4.jpg', 'Nous contacter', '/contact', 5000, 4);

INSERT INTO public.intro_videos (label, video_url, position) VALUES
('Séquence d''accueil 1', '/__l5e/assets-v1/d3af4e10-e8e6-4c4b-aba4-80e0eb75c9c8/intro-1.mp4', 1),
('Signature du logo', '/__l5e/assets-v1/d82dbc2e-3afb-46f9-816c-2bd125f94287/intro-2.mp4', 2);

INSERT INTO public.projects (slug, title, summary, content, image_url, category, location, status, is_featured, is_published, position) VALUES
('lotissement-residentiel', 'Lotissement résidentiel', 'Viabilisation et morcellement d''un domaine foncier destiné à l''habitat.', 'Études topographiques, plan de lotissement, ouverture de voies et bornage des parcelles. Projet conduit dans le respect des procédures foncières.', '/__l5e/assets-v1/cb472e17-7650-4789-95e4-28164cabda4b/hero1.jpg', 'Aménagement foncier', 'Côte d''Ivoire', 'en_cours', true, true, 1),
('programme-immobilier', 'Programme immobilier', 'Construction et commercialisation d''un ensemble de villas contemporaines.', 'De la conception architecturale à la livraison, un programme pensé pour la qualité de vie et la valeur patrimoniale.', '/__l5e/assets-v1/e4e6a769-2cdd-46a3-8b5f-362e6530ee0b/hero3.jpg', 'Immobilier', 'Abidjan', 'en_cours', true, true, 2),
('reseau-electrification', 'Réseau d''électrification', 'Travaux d''électrification et d''éclairage public sur zone aménagée.', 'Déploiement de réseaux HTA-MT-BT et d''éclairage public, avec mise en service et contrôle de conformité.', '/__l5e/assets-v1/85fbb32b-5308-4897-bd90-7dfbabfa7df5/hero4.jpg', 'Infrastructures', 'Côte d''Ivoire', 'termine', false, true, 3);

INSERT INTO public.news (slug, title, excerpt, content, image_url, author, published_at, is_published) VALUES
('lancement-du-site-officiel', 'Lancement du site officiel de LIGHT TERRA GROUP', 'LIGHT TERRA GROUP inaugure sa vitrine digitale officielle.', 'LIGHT TERRA GROUP met en ligne son site institutionnel : présentation des pôles d''activité, projets, actualités et accès direct à nos équipes pour toute demande d''information ou de devis.', '/__l5e/assets-v1/25d68820-649c-4bd2-8d50-4dfbf6e88881/hero2.jpg', 'LIGHT TERRA GROUP', now(), true);
-- roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- company info (single row)
CREATE TABLE public.company_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'LIGHT TERRA GROUP',
  slogan text NOT NULL DEFAULT 'BÂTIR LA TERRE, ÉCLAIRER L''AVENIR',
  description text,
  phone_primary text,
  phone_secondary text,
  whatsapp text,
  email text,
  address text,
  city text,
  country text,
  latitude numeric,
  longitude numeric,
  opening_hours text,
  website text,
  facebook_url text,
  linkedin_url text,
  instagram_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.company_info TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.company_info TO authenticated;
GRANT ALL ON public.company_info TO service_role;
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company info public read" ON public.company_info FOR SELECT USING (true);
CREATE POLICY "company info admin write" ON public.company_info FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER company_info_updated BEFORE UPDATE ON public.company_info FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- hero slides
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  image_url text NOT NULL,
  cta_label text,
  cta_url text,
  duration_ms integer NOT NULL DEFAULT 5000,
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_slides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;
GRANT ALL ON public.hero_slides TO service_role;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hero public read" ON public.hero_slides FOR SELECT USING (is_active);
CREATE POLICY "hero admin write" ON public.hero_slides FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER hero_slides_updated BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- intro videos
CREATE TABLE public.intro_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  video_url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.intro_videos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.intro_videos TO authenticated;
GRANT ALL ON public.intro_videos TO service_role;
ALTER TABLE public.intro_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "videos public read" ON public.intro_videos FOR SELECT USING (is_active);
CREATE POLICY "videos admin write" ON public.intro_videos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER intro_videos_updated BEFORE UPDATE ON public.intro_videos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- activities
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  short_description text NOT NULL,
  description text,
  icon text,
  image_url text,
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.activities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities public read" ON public.activities FOR SELECT USING (is_active);
CREATE POLICY "activities admin write" ON public.activities FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER activities_updated BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  content text,
  image_url text,
  category text,
  location text,
  status text NOT NULL DEFAULT 'en_cours',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects public read" ON public.projects FOR SELECT USING (is_published);
CREATE POLICY "projects admin write" ON public.projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- news
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text,
  image_url text,
  author text,
  published_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX news_published_idx ON public.news (is_published, published_at DESC);
GRANT SELECT ON public.news TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news public read" ON public.news FOR SELECT USING (is_published);
CREATE POLICY "news admin write" ON public.news FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER news_updated BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.increment_news_view(_slug text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.news SET view_count = view_count + 1 WHERE slug = _slug AND is_published;
$$;
GRANT EXECUTE ON FUNCTION public.increment_news_view(text) TO anon, authenticated;

-- partners
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website_url text,
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners public read" ON public.partners FOR SELECT USING (is_active);
CREATE POLICY "partners admin write" ON public.partners FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER partners_updated BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- testimonials
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_role text,
  company text,
  message text NOT NULL,
  rating integer,
  status text NOT NULL DEFAULT 'en_attente',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.testimonials TO anon, authenticated;
GRANT UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials public read" ON public.testimonials FOR SELECT USING (is_published AND status = 'valide');
CREATE POLICY "testimonials public submit" ON public.testimonials FOR INSERT WITH CHECK (status = 'en_attente' AND is_published = false);
CREATE POLICY "testimonials admin read" ON public.testimonials FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "testimonials admin write" ON public.testimonials FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "testimonials admin delete" ON public.testimonials FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER testimonials_updated BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- messages / quote requests
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  request_type text NOT NULL DEFAULT 'contact',
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'nouveau',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages public submit" ON public.messages FOR INSERT WITH CHECK (status = 'nouveau');
CREATE POLICY "messages admin manage" ON public.messages FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "messages admin update" ON public.messages FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "messages admin delete" ON public.messages FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER messages_updated BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- AI knowledge base
CREATE TABLE public.ai_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_knowledge TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ai_knowledge TO authenticated;
GRANT ALL ON public.ai_knowledge TO service_role;
ALTER TABLE public.ai_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knowledge public read" ON public.ai_knowledge FOR SELECT USING (is_active);
CREATE POLICY "knowledge admin write" ON public.ai_knowledge FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER ai_knowledge_updated BEFORE UPDATE ON public.ai_knowledge FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- traffic stats
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  device text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX page_views_created_idx ON public.page_views (created_at DESC);
GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "views public insert" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "views admin read" ON public.page_views FOR SELECT TO authenticated USING (public.is_admin());

-- seed institutional content
INSERT INTO public.company_info (name, slogan, description, phone_primary, whatsapp, email, address, city, country, website)
VALUES ('LIGHT TERRA GROUP', 'BÂTIR LA TERRE, ÉCLAIRER L''AVENIR',
'LIGHT TERRA GROUP est une entreprise qui valorise la terre et transforme les opportunités foncières en projets d''avenir.',
NULL, NULL, NULL, NULL, 'Abidjan', 'Côte d''Ivoire', NULL);

INSERT INTO public.activities (slug, title, short_description, description, icon, position) VALUES
('amenagement-foncier', 'Aménagement foncier & études', 'Acquisition, valorisation et aménagement de terrains, études techniques, topographiques et foncières.', 'Études topographiques et foncières, plans de lotissement et de morcellement, dossiers techniques complets pour sécuriser et valoriser chaque parcelle.', 'compass', 1),
('immobilier', 'Immobilier', 'Achat, vente, bail et mise en valeur de terrains et propriétés immobilières.', 'Nous accompagnons particuliers, entreprises et institutions dans leurs opérations immobilières, de la recherche du foncier à la transaction finale.', 'building', 2),
('btp-vrd', 'BTP & VRD', 'Travaux de bâtiment, travaux publics, voirie et réseaux divers.', 'Réalisation de bâtiments, voiries, assainissement et réseaux divers, avec un pilotage rigoureux des délais et de la qualité.', 'hard-hat', 3),
('eau-electrification', 'Eau, électrification & infrastructures', 'Adduction d''eau potable, électrification HTA-MT-BT-EP et infrastructures.', 'Conception et réalisation de réseaux d''eau potable et d''électrification, éclairage public et infrastructures essentielles.', 'zap', 4),
('reseaux-electroniques', 'Réseaux électroniques, informatiques & vidéosurveillance', 'Réseaux électroniques, informatiques et systèmes de vidéosurveillance.', 'Déploiement de réseaux structurés, systèmes de sécurité et de vidéosurveillance pour sites résidentiels, industriels et institutionnels.', 'cctv', 5),
('engins-equipements', 'Engins & équipements', 'Location d''engins et de matériels de chantier.', 'Une flotte d''engins et d''équipements de chantier disponible pour vos travaux, avec opérateurs qualifiés.', 'truck', 6),
('promotion-immobiliere', 'Promotion, gestion et commercialisation immobilière', 'Promotion, construction, gestion et commercialisation de biens immobiliers.', 'De la conception du programme à la commercialisation, nous portons les projets immobiliers et en assurons la gestion.', 'key-round', 7);

INSERT INTO public.ai_knowledge (question, answer, category) VALUES
('Que fait LIGHT TERRA GROUP ?', 'LIGHT TERRA GROUP valorise la terre et transforme les opportunités foncières en projets d''avenir : aménagement foncier et études, immobilier, BTP & VRD, eau et électrification, réseaux électroniques et vidéosurveillance, engins et équipements, promotion et commercialisation immobilière.', 'general'),
('Comment demander un devis ?', 'Rendez-vous sur la page « Nos services / Demande de devis » du site et remplissez le formulaire en décrivant votre besoin. Notre équipe revient vers vous après étude de la demande.', 'contact'),
('Comment contacter l''entreprise ?', 'La page Contact regroupe tous les moyens de contact officiels de LIGHT TERRA GROUP ainsi qu''un formulaire de message.', 'contact');
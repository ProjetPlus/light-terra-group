CREATE TABLE public.media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'photo',
  title text,
  description text,
  url text NOT NULL,
  poster_url text,
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT media_items_kind_check CHECK (kind IN ('photo','video')),
  CONSTRAINT media_items_url_len CHECK (char_length(url) BETWEEN 3 AND 1000)
);

GRANT SELECT ON public.media_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_items TO authenticated;
GRANT ALL ON public.media_items TO service_role;

ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media public read" ON public.media_items
FOR SELECT USING (is_active);

CREATE POLICY "media admin write" ON public.media_items
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE TRIGGER media_items_updated BEFORE UPDATE ON public.media_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.media_items (kind, title, url, poster_url, position) VALUES
('photo', 'Aménagement foncier', '/media/hero1.jpg', NULL, 1),
('photo', 'Chantier BTP & VRD', '/media/hero2.jpg', NULL, 2),
('photo', 'Programme résidentiel', '/media/hero3.jpg', NULL, 3),
('photo', 'Électrification', '/media/hero4.jpg', NULL, 4),
('video', 'Séquence 1', '/media/intro-1.mp4', '/media/hero1.jpg', 5),
('video', 'Séquence 2', '/media/intro-2.mp4', '/media/hero2.jpg', 6);
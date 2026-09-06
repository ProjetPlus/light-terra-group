-- 1. Validation constraints on publicly-insertable tables
ALTER TABLE public.messages
  ADD CONSTRAINT messages_full_name_len CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120),
  ADD CONSTRAINT messages_email_valid CHECK (char_length(email) <= 200 AND email ~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT messages_message_len CHECK (char_length(btrim(message)) BETWEEN 5 AND 5000),
  ADD CONSTRAINT messages_phone_len CHECK (phone IS NULL OR char_length(phone) <= 40),
  ADD CONSTRAINT messages_company_len CHECK (company IS NULL OR char_length(company) <= 160),
  ADD CONSTRAINT messages_subject_len CHECK (subject IS NULL OR char_length(subject) <= 200),
  ADD CONSTRAINT messages_request_type_valid CHECK (request_type IN ('contact','devis','partenariat','recrutement','autre')),
  ADD CONSTRAINT messages_status_valid CHECK (status IN ('nouveau','en_cours','traite','archive'));

ALTER TABLE public.testimonials
  ADD CONSTRAINT testimonials_author_len CHECK (char_length(btrim(author_name)) BETWEEN 2 AND 120),
  ADD CONSTRAINT testimonials_message_len CHECK (char_length(btrim(message)) BETWEEN 5 AND 2000),
  ADD CONSTRAINT testimonials_role_len CHECK (author_role IS NULL OR char_length(author_role) <= 160),
  ADD CONSTRAINT testimonials_company_len CHECK (company IS NULL OR char_length(company) <= 160),
  ADD CONSTRAINT testimonials_rating_range CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  ADD CONSTRAINT testimonials_status_valid CHECK (status IN ('en_attente','valide','refuse'));

ALTER TABLE public.page_views
  ADD CONSTRAINT page_views_path_valid CHECK (char_length(path) BETWEEN 1 AND 300 AND path LIKE '/%%'),
  ADD CONSTRAINT page_views_referrer_len CHECK (referrer IS NULL OR char_length(referrer) <= 500),
  ADD CONSTRAINT page_views_device_valid CHECK (device IS NULL OR device IN ('mobile','tablet','desktop'));

-- 2. Tighten public insert policies
DROP POLICY IF EXISTS "messages public submit" ON public.messages;
CREATE POLICY "messages public submit" ON public.messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'nouveau'
    AND char_length(btrim(full_name)) BETWEEN 2 AND 120
    AND char_length(btrim(message)) BETWEEN 5 AND 5000
    AND request_type IN ('contact','devis','partenariat','recrutement','autre')
  );

DROP POLICY IF EXISTS "testimonials public submit" ON public.testimonials;
CREATE POLICY "testimonials public submit" ON public.testimonials
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'en_attente' AND is_published = false
    AND char_length(btrim(author_name)) BETWEEN 2 AND 120
    AND char_length(btrim(message)) BETWEEN 5 AND 2000
    AND (rating IS NULL OR rating BETWEEN 1 AND 5)
  );

DROP POLICY IF EXISTS "views public insert" ON public.page_views;
CREATE POLICY "views public insert" ON public.page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(path) BETWEEN 1 AND 300 AND path LIKE '/%%'
    AND (referrer IS NULL OR char_length(referrer) <= 500)
    AND (device IS NULL OR device IN ('mobile','tablet','desktop'))
  );

-- 3. Replace SECURITY DEFINER function calls in policies with inline role checks
DROP POLICY IF EXISTS "own roles readable" ON public.user_roles;
CREATE POLICY "own roles readable" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "activities admin write" ON public.activities;
CREATE POLICY "activities admin write" ON public.activities FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "knowledge admin write" ON public.ai_knowledge;
CREATE POLICY "knowledge admin write" ON public.ai_knowledge FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "company info admin write" ON public.company_info;
CREATE POLICY "company info admin write" ON public.company_info FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "hero admin write" ON public.hero_slides;
CREATE POLICY "hero admin write" ON public.hero_slides FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "videos admin write" ON public.intro_videos;
CREATE POLICY "videos admin write" ON public.intro_videos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "news admin write" ON public.news;
CREATE POLICY "news admin write" ON public.news FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "partners admin write" ON public.partners;
CREATE POLICY "partners admin write" ON public.partners FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "projects admin write" ON public.projects;
CREATE POLICY "projects admin write" ON public.projects FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "views admin read" ON public.page_views;
CREATE POLICY "views admin read" ON public.page_views FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "messages admin manage" ON public.messages;
CREATE POLICY "messages admin manage" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));
DROP POLICY IF EXISTS "messages admin update" ON public.messages;
CREATE POLICY "messages admin update" ON public.messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));
DROP POLICY IF EXISTS "messages admin delete" ON public.messages;
CREATE POLICY "messages admin delete" ON public.messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "testimonials admin read" ON public.testimonials;
CREATE POLICY "testimonials admin read" ON public.testimonials FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));
DROP POLICY IF EXISTS "testimonials admin write" ON public.testimonials;
CREATE POLICY "testimonials admin write" ON public.testimonials FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));
DROP POLICY IF EXISTS "testimonials admin delete" ON public.testimonials;
CREATE POLICY "testimonials admin delete" ON public.testimonials FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

-- 4. Remove signed-in access to the privileged role helper functions
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated, anon, PUBLIC;
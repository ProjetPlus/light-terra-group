-- 1. Media URLs -> local /media paths
UPDATE public.hero_slides SET image_url = '/media/' || regexp_replace(image_url, '^.*/', '') WHERE image_url LIKE '/__l5e/%';
UPDATE public.projects SET image_url = '/media/' || regexp_replace(image_url, '^.*/', '') WHERE image_url LIKE '/__l5e/%';
UPDATE public.news SET image_url = '/media/' || regexp_replace(image_url, '^.*/', '') WHERE image_url LIKE '/__l5e/%';
UPDATE public.intro_videos SET video_url = '/media/' || regexp_replace(video_url, '^.*/', '') WHERE video_url LIKE '/__l5e/%';

-- 2. Wording: Eau -> Hydraulique
UPDATE public.activities
SET title = 'Hydraulique, électrification & infrastructures',
    short_description = 'Hydraulique et adduction d''eau potable, électrification HTA-MT-BT-EP et infrastructures.',
    description = 'Conception et réalisation de réseaux hydrauliques et d''adduction d''eau potable, d''électrification HTA-MT-BT-EP, d''éclairage public et d''infrastructures essentielles.'
WHERE title = 'Eau, électrification & infrastructures';

-- 3. Video labels
UPDATE public.intro_videos SET label = 'Séquence 1' WHERE label = 'Séquence d''accueil 1';
UPDATE public.intro_videos SET label = 'Séquence 2' WHERE label = 'Signature du logo';

-- 4. Second WhatsApp number
UPDATE public.company_info
SET whatsapp = '+225 07 49 22 47 22',
    phone_secondary = '+225 07 07 74 14 84';

-- 5. Quote request fields + admin reply tracking
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS project_type text,
  ADD COLUMN IF NOT EXISTS budget_range text,
  ADD COLUMN IF NOT EXISTS desired_date date,
  ADD COLUMN IF NOT EXISTS admin_reply text,
  ADD COLUMN IF NOT EXISTS replied_at timestamptz;

ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_project_type_len,
  DROP CONSTRAINT IF EXISTS messages_budget_range_len,
  DROP CONSTRAINT IF EXISTS messages_admin_reply_len;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_project_type_len CHECK (project_type IS NULL OR char_length(project_type) <= 120),
  ADD CONSTRAINT messages_budget_range_len CHECK (budget_range IS NULL OR char_length(budget_range) <= 120),
  ADD CONSTRAINT messages_admin_reply_len CHECK (admin_reply IS NULL OR char_length(admin_reply) <= 5000);
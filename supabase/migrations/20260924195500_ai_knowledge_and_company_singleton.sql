-- Light Terra Group: AI knowledge + singleton company configuration
create table if not exists public.ai_knowledge (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ai_knowledge enable row level security;

drop policy if exists "ai_knowledge_public_read" on public.ai_knowledge;
create policy "ai_knowledge_public_read"
on public.ai_knowledge for select
to anon, authenticated
using (is_active = true);

drop policy if exists "ai_knowledge_admin_all" on public.ai_knowledge;
create policy "ai_knowledge_admin_all"
on public.ai_knowledge for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create unique index if not exists company_info_singleton_idx
on public.company_info ((true));

insert into public.ai_knowledge (question, answer, position)
select * from (values
  ('Que fait LIGHT TERRA GROUP ?', 'LIGHT TERRA GROUP intervient notamment dans l’aménagement foncier, le BTP & VRD, l’immobilier, l’hydraulique et l’électrification.', 1),
  ('Comment demander un devis ?', 'Vous pouvez utiliser la page Services & devis ou le formulaire de contact du site pour transmettre votre besoin.', 2),
  ('Comment contacter LIGHT TERRA GROUP ?', 'Les coordonnées disponibles sur le site permettent de contacter LIGHT TERRA GROUP par téléphone, WhatsApp ou e-mail.', 3)
) as seed(question, answer, position)
where not exists (select 1 from public.ai_knowledge);

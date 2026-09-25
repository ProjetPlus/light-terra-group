import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { MediaPreview } from "@/components/site/MediaPreview";
import { projectItemQuery, projectsQuery } from "@/lib/site-data";

const STATUS_LABEL: Record<string, string> = { en_cours: "En cours", termine: "Terminé", a_venir: "À venir" };
export const Route = createFileRoute("/projets/$slug")({
  head: () => ({
    meta: [
      { title: "Projet — LT GROUP" },
      { name: "description", content: "Découvrez ce projet de LT GROUP." },
      { property: "og:image", content: "/media/og-light-terra.png" },
    ],
  }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const { data: project, isLoading } = useQuery(projectItemQuery(slug));
  const { data: allProjects } = useQuery(projectsQuery);
  if (isLoading) return <SiteLayout><section className="mx-auto max-w-5xl px-5 py-24"><p className="text-muted-foreground">Chargement…</p></section></SiteLayout>;
  if (!project) return <SiteLayout><PageHero eyebrow="Projet" title="Projet introuvable" description="Ce projet n’est plus disponible." /><section className="mx-auto max-w-5xl px-5 py-16"><Link to="/projets" className="font-semibold underline">← Tous les projets</Link></section></SiteLayout>;
  const related = (allProjects ?? []).filter((p) => p.slug !== project.slug).slice(0, 3);
  return <SiteLayout>
    <PageHero eyebrow={project.category ?? "Projet"} title={project.title} description={project.summary ?? ""} />
    <article className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
      {project.cover_image_url ? <MediaPreview url={project.cover_image_url} alt={project.title + " — couverture"} className="max-h-[520px] w-full rounded-2xl object-cover shadow-elevated" /> : null}{project.image_url ? <div className="mt-6"><MediaPreview url={project.image_url} alt={`${project.title} — média`} className="max-h-[650px] w-full rounded-2xl object-cover shadow-elevated" controls /></div> : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]"><div>
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">{project.category ? <span>{project.category}</span> : null}<span className="rounded-full bg-accent px-3 py-1 text-gold-deep">{STATUS_LABEL[project.status] ?? project.status}</span></div>
        {project.content ? <div className="mt-8 whitespace-pre-line text-base leading-8 text-foreground/80">{project.content}</div> : null}
      </div><aside className="rounded-2xl border border-border bg-card p-6"><p className="eyebrow">Informations</p>{project.location ? <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 text-gold" />{project.location}</p> : null}<Link to="/contact" className="mt-6 inline-flex font-semibold underline">Parler de ce projet →</Link></aside></div>
      {related.length ? <section className="mt-16 border-t border-border pt-12"><p className="eyebrow">Autres projets</p><div className="mt-6 grid gap-6 md:grid-cols-3">{related.map((p) => <Link key={p.id} to={"/projets/$slug" as never} params={{ slug: p.slug } as never} className="overflow-hidden rounded-2xl border border-border bg-card hover:shadow-elevated">{p.cover_image_url || p.image_url ? <MediaPreview url={p.cover_image_url || p.image_url || ""} alt={p.title} className="h-40 w-full object-cover" /> : null}<div className="p-5"><h2 className="text-lg">{p.title}</h2><p className="mt-2 text-sm text-muted-foreground">{p.summary}</p></div></Link>)}</div></section> : null}
    </article>
  </SiteLayout>;
}
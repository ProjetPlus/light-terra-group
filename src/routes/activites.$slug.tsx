import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { MediaPreview } from "@/components/site/MediaPreview";
import { activityItemQuery, activitiesQuery, projectsQuery } from "@/lib/site-data";

export const Route = createFileRoute("/activites/$slug")({
  head: () => ({
    meta: [
      { title: "Activité — LT GROUP" },
      { name: "description", content: "Découvrez un pôle d'activité de LT GROUP." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const { data: activity, isLoading } = useQuery(activityItemQuery(slug));
  const { data: activities } = useQuery(activitiesQuery);
  const { data: projects } = useQuery(projectsQuery);

  if (isLoading) {
    return <SiteLayout><section className="mx-auto max-w-5xl px-5 py-24"><p className="text-muted-foreground">Chargement…</p></section></SiteLayout>;
  }

  if (!activity) {
    return <SiteLayout>
      <PageHero eyebrow="Nos activités" title="Pôle introuvable" description="Ce pôle d'activité n'est plus disponible." />
      <section className="mx-auto max-w-5xl px-5 py-16"><Link to="/activites" className="font-semibold underline">← Toutes nos activités</Link></section>
    </SiteLayout>;
  }

  const relatedProjects = (projects ?? []).filter((project) => project.category === activity.title || project.category === activity.slug).slice(0, 6);
  const otherActivities = (activities ?? []).filter((item) => item.slug !== activity.slug).slice(0, 3);

  return <SiteLayout>
    <PageHero eyebrow="Pôle d'activité" title={activity.title} description={activity.short_description} />
    <article className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
      {activity.image_url ? (
        <MediaPreview url={activity.image_url} alt={activity.title} className="max-h-[560px] w-full rounded-2xl object-cover shadow-elevated" />
      ) : null}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div>
          <p className="eyebrow">Notre intervention</p>
          <h2 className="mt-3 text-3xl">Un accompagnement adapté à chaque projet</h2>
          <div className="mt-6 whitespace-pre-line text-base leading-8 text-foreground/80">
            {activity.description ?? activity.short_description}
          </div>
        </div>
        <aside className="rounded-2xl border border-border bg-card p-6">
          <p className="eyebrow">Parlons de votre projet</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Présentez-nous votre besoin et notre équipe vous orientera vers les interlocuteurs concernés.</p>
          <Link to="/services" className="mt-6 inline-flex items-center gap-2 font-semibold underline underline-offset-4">Demander un devis <ArrowRight className="h-4 w-4" /></Link>
        </aside>
      </div>

      {relatedProjects.length ? (
        <section className="mt-16 border-t border-border pt-12">
          <p className="eyebrow">Réalisations liées</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {relatedProjects.map((project) => (
              <Link key={project.id} to={"/projets/$slug" as any} params={{ slug: project.slug } as any} className="overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-elevated">
                {project.cover_image_url || project.image_url ? <MediaPreview url={project.cover_image_url || project.image_url || ""} alt={project.title} className="h-44 w-full object-cover" /> : null}
                <div className="p-5"><h3 className="text-lg">{project.title}</h3><p className="mt-2 text-sm text-muted-foreground">{project.summary}</p></div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {otherActivities.length ? (
        <section className="mt-16 border-t border-border pt-12">
          <p className="eyebrow">Explorer nos autres pôles</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {otherActivities.map((item) => (
              <Link key={item.id} to={"/activites/$slug" as any} params={{ slug: item.slug } as any} className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-elevated">
                <h3 className="text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.short_description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  </SiteLayout>;
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { projectsQuery } from "@/lib/site-data";

const title = "Projets & réalisations — LIGHT TERRA GROUP";
const description = "Découvrez les projets fonciers, immobiliers et électriques réalisés par LIGHT TERRA GROUP.";

export const Route = createFileRoute("/projets")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const STATUS_LABEL: Record<string, string> = {
  en_cours: "En cours",
  termine: "Terminé",
  a_venir: "À venir",
};

function Page() {
  const { data: projects, isLoading } = useQuery(projectsQuery);
  const [filter, setFilter] = useState<string>("tous");

  const categories = Array.from(new Set((projects ?? []).map((p) => p.category).filter(Boolean) as string[]));
  const list = (projects ?? []).filter((p) => filter === "tous" || p.category === filter);

  return (
    <SiteLayout>
      <PageHero eyebrow="Réalisations" title="Nos projets" description={description} />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        {categories.length > 0 ? (
          <div className="mb-10 flex flex-wrap gap-2">
            {["tous", ...categories].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={
                  filter === cat
                    ? "rounded-sm bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-ink-foreground"
                    : "rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-muted-foreground transition hover:border-gold hover:text-foreground"
                }
              >
                {cat === "tous" ? "Tous" : cat}
              </button>
            ))}
          </div>
        ) : null}

        {isLoading ? <p className="text-muted-foreground">Chargement…</p> : null}
        {!isLoading && list.length === 0 ? (
          <p className="text-muted-foreground">Nos projets seront publiés prochainement.</p>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((project) => (
            <article
              key={project.id}
              className="overflow-hidden rounded-lg border border-border bg-card transition hover:-translate-y-1 hover:shadow-elevated"
            >
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : null}
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">{project.category ?? "Projet"}</p>
                  <span className="rounded-full bg-accent px-3 py-1 text-[0.65rem] uppercase tracking-[0.12em] text-gold-deep">
                    {STATUS_LABEL[project.status] ?? project.status}
                  </span>
                </div>
                <h2 className="mt-2 text-lg">{project.title}</h2>
                {project.location ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-gold" /> {project.location}
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {project.summary ?? project.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

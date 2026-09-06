import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { formatDateFr, newsListQuery } from "@/lib/site-data";

const title = "Actualités — LIGHT TERRA GROUP";
const description = "Les dernières actualités, chantiers et annonces de LIGHT TERRA GROUP.";

export const Route = createFileRoute("/actualites")({
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

function Page() {
  const { data: news, isLoading } = useQuery(newsListQuery);
  const list = news ?? [];

  return (
    <SiteLayout>
      <PageHero eyebrow="Actualités" title="La vie du groupe" description={description} />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        {isLoading ? <p className="text-muted-foreground">Chargement…</p> : null}
        {!isLoading && list.length === 0 ? (
          <p className="text-muted-foreground">Aucune actualité publiée pour le moment.</p>
        ) : null}

        <div className="grid gap-8">
          {list.map((item) => (
            <article
              key={item.id}
              className="grid gap-6 overflow-hidden rounded-lg border border-border bg-card md:grid-cols-[280px_1fr]"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                  className="h-full min-h-48 w-full object-cover"
                />
              ) : null}
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {formatDateFr(item.published_at ?? item.created_at)}
                  {item.author ? ` — ${item.author}` : ""}
                </p>
                <h2 className="mt-3 text-2xl">{item.title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{item.excerpt}</p>
                {item.content ? (
                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {item.content}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

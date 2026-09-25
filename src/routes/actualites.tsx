import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Link } from "@tanstack/react-router";
import { formatDateFr, newsListQuery } from "@/lib/site-data";
import { MediaPreview } from "@/components/site/MediaPreview";

const title = "Actualités — LT GROUP";
const description = "Les dernières actualités, chantiers et annonces de LT GROUP.";

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
          {list.map((item) => {
            const mediaUrl = item.cover_image_url ?? item.image_url ?? item.video_url;
            return (
              <Link
                key={item.id}
                to="/actualites/$slug"
                params={{ slug: item.slug }}
                className="group grid gap-6 overflow-hidden rounded-lg border border-border bg-card transition hover:-translate-y-1 hover:shadow-elevated md:grid-cols-[280px_1fr]"
              >
                {mediaUrl ? (
                  <MediaPreview
                    url={mediaUrl}
                    alt={item.title}
                    poster={item.video_poster_url}
                    autoPlay={!item.video_poster_url}
                    loop
                    className="h-full min-h-48 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                ) : null}
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {formatDateFr(item.published_at ?? item.created_at)}
                    {item.author ? ` — ${item.author}` : ""}
                  </p>
                  <h2 className="mt-3 text-2xl">{item.title}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{item.excerpt}</p>
                  <span className="mt-5 inline-flex text-sm font-semibold underline underline-offset-4">Lire l’actualité →</span>
                </div>
              </Link>
            );
          })}       </div>
      </section>
    </SiteLayout>
  );
}

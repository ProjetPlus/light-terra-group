import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { formatDateFr, newsItemQuery, newsListQuery } from "@/lib/site-data";
import { MediaPreview } from "@/components/site/MediaPreview";

export const Route = createFileRoute("/actualites/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(newsItemQuery(params.slug)),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.title ? `${loaderData.title} — LT GROUP` : "Actualité — LT GROUP" },
      { name: "description", content: loaderData?.excerpt ?? "Actualité LT GROUP." },
      { property: "og:title", content: loaderData?.title ?? "Actualité — LT GROUP" },
      { property: "og:description", content: loaderData?.excerpt ?? "Actualité LT GROUP." },
      { property: "og:image", content: loaderData?.video_poster_url ?? loaderData?.image_url ?? "/media/og-light-terra.png" },
    ],
  }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const { data: item, isLoading } = useQuery(newsItemQuery(slug));
  const { data: allNews } = useQuery(newsListQuery);

  if (isLoading) {
    return <SiteLayout><section className="mx-auto max-w-5xl px-5 py-24 lg:px-8"><p className="text-muted-foreground">Chargement…</p></section></SiteLayout>;
  }

  if (!item) {
    return (
      <SiteLayout>
        <PageHero eyebrow="Actualités" title="Actualité introuvable" description="Cette publication n’est plus disponible." />
        <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
          <Link to="/actualites" className="text-sm font-semibold underline underline-offset-4">← Retour aux actualités</Link>
        </section>
      </SiteLayout>
    );
  }

  const related = (allNews ?? []).filter((news) => news.slug !== item.slug).slice(0, 2);

  return (
    <SiteLayout>
      <PageHero eyebrow="Actualité" title={item.title} description={item.excerpt ?? ""} />
      <article className="mx-auto max-w-5xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span>{formatDateFr(item.published_at ?? item.created_at)}</span>
          {item.author ? <span>— {item.author}</span> : null}
        </div>

        {item.image_url || item.video_url ? (
          <MediaPreview
            url={item.image_url ?? item.video_url}
            alt={item.title}
            poster={item.video_poster_url}
            className="max-h-[620px] w-full rounded-2xl object-cover shadow-elevated"
            controls
          />
        ) : null}

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="whitespace-pre-line text-base leading-8 text-foreground/80">
            {item.content}
          </div>
          <div className="mt-12 border-t border-border pt-8">
            <Link to="/actualites" className="text-sm font-semibold underline underline-offset-4">← Toutes les actualités</Link>
          </div>
        </div>

        {related.length ? (
          <section className="mt-16 border-t border-border pt-12">
            <p className="eyebrow">À découvrir également</p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {related.map((news) => (
                <Link key={news.id} to="/actualites/$slug" params={{ slug: news.slug }} className="overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-elevated">
                  {news.image_url || news.video_url ? <MediaPreview url={news.image_url ?? news.video_url} alt={news.title} poster={news.video_poster_url} className="h-48 w-full object-cover" /> : null}
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{formatDateFr(news.published_at ?? news.created_at)}</p>
                    <h2 className="mt-2 text-xl">{news.title}</h2>
                    {news.excerpt ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{news.excerpt}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </SiteLayout>
  );
}

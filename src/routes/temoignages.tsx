import { createFileRoute } from "@tanstack/react-router";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";

const title = "Témoignages — LIGHT TERRA GROUP";
const description = "Les retours de nos clients et partenaires.";

export const Route = createFileRoute("/temoignages")({
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
  return (
    <SiteLayout>
      <PageHero eyebrow="Témoignages" title="Ils parlent de nous" description={description} />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <p className="text-muted-foreground">Contenu en cours de préparation.</p>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";

const title = "Projets — LIGHT TERRA GROUP";
const description = "Découvrez les projets menés par LIGHT TERRA GROUP.";

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

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Projets" title="Nos réalisations" description={description} />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <p className="text-muted-foreground">Contenu en cours de préparation.</p>
      </section>
    </SiteLayout>
  );
}

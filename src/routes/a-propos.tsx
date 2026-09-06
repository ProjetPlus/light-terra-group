import { createFileRoute } from "@tanstack/react-router";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";

const title = "À propos — LIGHT TERRA GROUP";
const description = "LIGHT TERRA GROUP valorise la terre et transforme les opportunités foncières en projets d'avenir.";

export const Route = createFileRoute("/a-propos")({
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
      <PageHero eyebrow="À propos" title="Notre histoire" description={description} />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <p className="text-muted-foreground">Contenu en cours de préparation.</p>
      </section>
    </SiteLayout>
  );
}

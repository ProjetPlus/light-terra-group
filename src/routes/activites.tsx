import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Compass, Hammer, Zap } from "lucide-react";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { activitiesQuery } from "@/lib/site-data";

const title = "Nos activités — LIGHT TERRA GROUP";
const description =
  "Aménagement foncier, BTP, promotion immobilière, infrastructures électriques : découvrez les pôles d'activité de LIGHT TERRA GROUP.";

export const Route = createFileRoute("/activites")({
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

const ICONS: Record<string, typeof Building2> = {
  compass: Compass,
  hammer: Hammer,
  building: Building2,
  zap: Zap,
};

function Page() {
  const { data: activities, isLoading } = useQuery(activitiesQuery);

  return (
    <SiteLayout>
      <PageHero eyebrow="Nos activités" title="Nos pôles d'activité" description={description} />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        {isLoading ? <p className="text-muted-foreground">Chargement…</p> : null}
        <div className="grid gap-8">
          {(activities ?? []).map((activity, i) => {
            const Icon = ICONS[activity.icon ?? ""] ?? Building2;
            return (
              <article
                key={activity.id}
                className="grid gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[auto_1fr] lg:p-8"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-sm bg-accent text-gold-deep">
                  <Icon className="h-7 w-7" />
                </span>
                <div>
                  <p className="eyebrow">{String(i + 1).padStart(2, "0")}</p>
                  <h2 className="mt-2 text-2xl">{activity.title}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {activity.description ?? activity.short_description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12">
          <Button asChild variant="gold" size="lg">
            <Link to="/services">Demander un devis</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}

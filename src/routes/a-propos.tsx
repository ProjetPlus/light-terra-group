import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, Gem, Target } from "lucide-react";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { activitiesQuery, companyQuery } from "@/lib/site-data";

const title = "À propos — LIGHT TERRA GROUP";
const description =
  "LIGHT TERRA GROUP, groupe ivoirien spécialisé dans l'aménagement foncier, la construction, l'immobilier et les infrastructures électriques.";

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

const VALUES = [
  {
    icon: Target,
    title: "Notre mission",
    text: "Valoriser la terre et accompagner nos clients de l'étude à la livraison, avec des ouvrages fiables et durables.",
  },
  {
    icon: Eye,
    title: "Notre vision",
    text: "Devenir une référence en Côte d'Ivoire et dans la sous-région pour l'aménagement, la construction et l'énergie.",
  },
  {
    icon: Gem,
    title: "Nos valeurs",
    text: "Rigueur, transparence, respect des délais et proximité avec chaque client, du particulier à l'institution.",
  },
];

function Page() {
  const { data: company } = useQuery(companyQuery);
  const { data: activities } = useQuery(activitiesQuery);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="À propos"
        title={company?.name ?? "LIGHT TERRA GROUP"}
        description={company?.slogan ?? "Bâtir la terre, éclairer l'avenir"}
      />

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Qui sommes-nous</p>
            <h2 className="mt-3 text-3xl">Un groupe pluridisciplinaire</h2>
            <hr className="gold-rule mt-6 w-24" />
            <p className="mt-6 leading-relaxed text-muted-foreground">
              {company?.description ??
                "LIGHT TERRA GROUP intervient sur toute la chaîne de valeur : identification et sécurisation du foncier, viabilisation, construction, promotion immobilière et infrastructures électriques."}
            </p>
            {company?.address ? (
              <p className="mt-6 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Siège social : </span>
                {[company.address, company.city, company.country].filter(Boolean).join(", ")}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5">
            {VALUES.map((value) => (
              <article key={value.title} className="rounded-lg border border-border bg-card p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-accent text-gold-deep">
                  <value.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xl">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {activities && activities.length > 0 ? (
        <section className="bg-muted/50 py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="eyebrow">Domaines d'intervention</p>
            <h2 className="mt-3 text-3xl">Ce que nous faisons</h2>
            <hr className="gold-rule mt-6 w-24" />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity) => (
                <li key={activity.id} className="rounded-lg border border-border bg-card p-5">
                  <h3 className="text-base">{activity.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{activity.short_description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}

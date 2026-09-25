import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Compass, Hammer, Zap } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { MediaPreview } from "@/components/site/MediaPreview";
import { activitiesQuery } from "@/lib/site-data";

const ICONS: Record<string, typeof Building2> = { compass: Compass, hammer: Hammer, building: Building2, zap: Zap, "hard-hat": Hammer };
export const Route = createFileRoute("/activites/$slug")({
  head: () => ({ meta: [{ title: "Activité — LIGHT TERRA GROUP" }, { name: "description", content: "Découvrez une activité de LIGHT TERRA GROUP." }] }),
  component: Page,
});
function Page() {
  const { slug } = Route.useParams();
  const { data: activities, isLoading } = useQuery(activitiesQuery);
  const activity = (activities ?? []).find((item) => item.slug === slug);
  if (isLoading) return <SiteLayout><section className="mx-auto max-w-5xl px-5 py-24"><p className="text-muted-foreground">Chargement…</p></section></SiteLayout>;
  if (!activity) return <SiteLayout><PageHero eyebrow="Activité" title="Activité introuvable" description="Cette activité n’est plus disponible." /><section className="mx-auto max-w-5xl px-5 py-16"><Link to="/activites" className="font-semibold underline">← Toutes les activités</Link></section></SiteLayout>;
  const Icon = ICONS[activity.icon ?? ""] ?? Building2;
  return <SiteLayout><PageHero eyebrow="Notre expertise" title={activity.title} description={activity.short_description} /><article className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20"><div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start"><div>{activity.image_url ? <MediaPreview url={activity.image_url} alt={activity.title} className="max-h-[560px] w-full rounded-2xl object-cover shadow-elevated" controls /> : <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-ink text-gold"><Icon className="h-20 w-20" /></div>}</div><div><span className="inline-flex h-14 w-14 items-center justify-center rounded-sm bg-accent text-gold-deep"><Icon className="h-7 w-7" /></span><p className="mt-8 whitespace-pre-line text-base leading-8 text-foreground/80">{activity.description ?? activity.short_description}</p><Link to="/contact" className="mt-8 inline-flex font-semibold underline">Demander un devis →</Link></div></div></article></SiteLayout>;
}
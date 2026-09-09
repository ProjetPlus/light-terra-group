import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  Cctv,
  Compass,
  HardHat,
  KeyRound,
  Truck,
  Zap,
} from "lucide-react";

import { PartnersStrip, SiteFooter, SiteHeader } from "@/components/site/SiteLayout";
import { AiAssistant } from "@/components/site/AiAssistant";
import { MediaGallery } from "@/components/site/MediaGallery";
import { Button } from "@/components/ui/button";
import {
  activitiesQuery,
  companyQuery,
  formatDateFr,
  heroSlidesQuery,
  introVideosQuery,
  newsListQuery,
  projectsQuery,
} from "@/lib/site-data";

const title = "LIGHT TERRA GROUP — Bâtir la terre, éclairer l'avenir";
const description =
  "LIGHT TERRA GROUP : aménagement foncier, BTP & VRD, immobilier, hydraulique et électrification à Abidjan, Côte d'Ivoire.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

/** Lecture en boucle continue des séquences vidéo, sans coupure visible. */
function IntroVideoLoop() {
  const { data: videos } = useQuery(introVideosQuery);
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLVideoElement>(null);
  const list = videos ?? [];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.load();
    void el.play().catch(() => undefined);
  }, [current, list.length]);

  if (list.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-gold/25 shadow-elevated">
      <video
        ref={ref}
        key={list[current]?.id}
        className="aspect-video w-full bg-black object-cover"
        src={list[current]?.video_url}
        muted
        playsInline
        autoPlay
        preload="auto"
        loop={list.length === 1}
        onEnded={() => setCurrent((c) => (c + 1) % list.length)}
      />
    </div>
  );
}

function Hero() {
  const { data: slides } = useQuery(heroSlidesQuery);
  const [index, setIndex] = useState(0);
  const list = slides ?? [];

  useEffect(() => {
    if (list.length < 2) return;
    const duration = list[index]?.duration_ms ?? 5000;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % list.length), duration);
    return () => clearTimeout(timer);
  }, [index, list]);

  return (
    <section className="relative w-full overflow-hidden bg-ink">
      {list.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          <img
            src={slide.image_url}
            alt={slide.title ?? "LIGHT TERRA GROUP"}
            className={i === index ? "h-full w-full object-cover animate-slow-zoom" : "h-full w-full object-cover"}
          />
          <div className="absolute inset-0 bg-veil" />
        </div>
      ))}
      <div className="absolute inset-0 bg-ink/45" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-28 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:pb-24 lg:pt-40">
        {/* Vidéo : en premier sur mobile, à gauche sur grand écran */}
        <div className="order-1">
          <p className="eyebrow text-gold">En images</p>
          <h2 className="mt-2 text-2xl text-ink-foreground lg:text-3xl">Notre savoir-faire en mouvement</h2>
          <div className="mt-5">
            <IntroVideoLoop />
          </div>
        </div>

        {/* Texte : sous la vidéo sur mobile, à droite sur grand écran */}
        <div className="order-2">
          <p className="eyebrow text-gold">Bâtir la terre, éclairer l'avenir</p>
          <h1
            key={index}
            className="animate-rise-in mt-4 text-4xl leading-tight text-ink-foreground lg:text-5xl"
          >
            {list[index]?.title ?? "LIGHT TERRA GROUP"}
          </h1>
          {list[index]?.subtitle ? (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-foreground/80">
              {list[index]?.subtitle}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <Link to="/services">Demander un devis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-gold/50 bg-transparent text-ink-foreground hover:bg-gold hover:text-ink"
            >
              <Link to="/projets">Voir nos réalisations</Link>
            </Button>
          </div>

          {list.length > 1 ? (
            <div className="mt-8 flex gap-2">
              {list.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Afficher la diapositive ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={
                    i === index
                      ? "h-1 w-12 rounded-full bg-gold-gradient"
                      : "h-1 w-6 rounded-full bg-ink-foreground/30 transition hover:bg-ink-foreground/60"
                  }
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export const ACTIVITY_ICONS: Record<string, typeof Building2> = {
  compass: Compass,
  hammer: HardHat,
  "hard-hat": HardHat,
  building: Building2,
  zap: Zap,
  cctv: Cctv,
  truck: Truck,
  "key-round": KeyRound,
};

function Activities() {
  const { data: activities } = useQuery(activitiesQuery);
  if (!activities || activities.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <p className="eyebrow">Nos pôles d'activité</p>
      <h2 className="mt-3 text-3xl lg:text-4xl">Un groupe, plusieurs expertises</h2>
      <hr className="gold-rule mt-6 w-24" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => {
          const Icon = ACTIVITY_ICONS[activity.icon ?? ""] ?? Building2;
          return (
            <article
              key={activity.id}
              className="group rounded-lg border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-elevated"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-accent text-gold-deep">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl">{activity.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{activity.short_description}</p>
            </article>
          );
        })}
      </div>
      <div className="mt-10">
        <Button asChild variant="outline">
          <Link to="/activites">
            Découvrir nos activités <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function FeaturedProjects() {
  const { data: projects } = useQuery(projectsQuery);
  const list = (projects ?? []).slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="eyebrow">Réalisations</p>
        <h2 className="mt-3 text-3xl lg:text-4xl">Des projets qui transforment le territoire</h2>
        <hr className="gold-rule mt-6 w-24" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {list.map((project) => (
            <article key={project.id} className="overflow-hidden rounded-lg border border-border bg-card">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : null}
              <div className="p-6">
                <p className="eyebrow">{project.category ?? "Projet"}</p>
                <h3 className="mt-2 text-lg">{project.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <Button asChild variant="gold">
            <Link to="/projets">Tous nos projets</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function LatestNews() {
  const { data: news } = useQuery(newsListQuery);
  const list = (news ?? []).slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <p className="eyebrow">Actualités</p>
      <h2 className="mt-3 text-3xl lg:text-4xl">La vie du groupe</h2>
      <hr className="gold-rule mt-6 w-24" />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {list.map((item) => (
          <article key={item.id} className="rounded-lg border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {formatDateFr(item.published_at ?? item.created_at)}
            </p>
            <h3 className="mt-3 text-lg">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>
          </article>
        ))}
      </div>
      <div className="mt-10">
        <Button asChild variant="outline">
          <Link to="/actualites">Toutes les actualités</Link>
        </Button>
      </div>
    </section>
  );
}

function CallToAction() {
  const { data: company } = useQuery(companyQuery);
  return (
    <section className="bg-ink-gradient py-20 text-ink-foreground lg:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 className="text-3xl lg:text-4xl">Un projet foncier, immobilier ou électrique ?</h2>
          <p className="mt-4 max-w-xl text-ink-foreground/70">
            Nos équipes vous accompagnent de l'étude à la livraison. Décrivez votre besoin, nous revenons vers vous
            rapidement.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="gold" size="lg">
            <Link to="/services">Demander un devis</Link>
          </Button>
          {company?.phone_primary ? (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-gold/50 bg-transparent text-ink-foreground hover:bg-gold hover:text-ink"
            >
              <a href={`tel:${company.phone_primary.replace(/\s/g, "")}`}>{company.phone_primary}</a>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Activities />
        <FeaturedProjects />
        <LatestNews />
        <CallToAction />
      </main>
      <PartnersStrip />
      <SiteFooter />
      <AiAssistant />
    </div>
  );
}

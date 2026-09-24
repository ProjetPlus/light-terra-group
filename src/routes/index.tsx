import { useEffect, useMemo, useRef, useState } from "react";
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
import { OG_IMAGE_URL, SITE_URL } from "@/lib/media";
import {
  activitiesQuery,
  companyQuery,
  formatDateFr,
  heroSlidesQuery,
  introVideosQuery,
  mediaItemsQuery,
  showcaseVideosQuery,
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
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:image:alt", content: "Logo officiel LIGHT TERRA GROUP" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

/** Lecture en boucle continue des séquences vidéo, sans coupure visible. */
function IntroVideoLoop() {
  const { data: videos } = useQuery(introVideosQuery);
  const { data: media } = useQuery(mediaItemsQuery);
  const list = useMemo(
    () =>
      videos?.length
        ? videos
        : (media ?? [])
            .filter((item) => item.kind === "video" && item.url)
            .map((item) => ({
              id: item.id,
              label: item.title ?? "Vidéo",
              video_url: item.url,
              position: item.position,
              is_active: item.is_active,
              placement: "hero_intro" as const,
              title: item.title,
              description: item.description,
              cta_label: null,
              cta_url: null,
            })),
    [videos, media],
  );
  const [active, setActive] = useState(0);
  const [front, setFront] = useState(0);
  const [ready, setReady] = useState(false);
  const frontRef = useRef<HTMLVideoElement>(null);
  const backRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!list.length) return;
    const first = frontRef.current;
    if (!first) return;
    const firstUrl = list.at(0)?.video_url;
    if (!firstUrl) return;
    first.src = firstUrl;
    first.preload = "auto";
    first.load();
    const play = () => void first.play().catch(() => undefined);
    first.addEventListener("canplay", play, { once: true });
    return () => first.removeEventListener("canplay", play);
  }, [list]);

  const next = list.length > 1 ? (active + 1) % list.length : active;

  useEffect(() => {
    if (list.length < 2) return;
    const hidden = front === 0 ? backRef.current : frontRef.current;
    const nextUrl = list[next]?.video_url;
    if (!hidden || !nextUrl) return;

    setReady(false);
    hidden.src = nextUrl;
    hidden.preload = "auto";
    hidden.load();

    const markReady = () => setReady(true);
    hidden.addEventListener("canplay", markReady, { once: true });
    hidden.addEventListener("loadeddata", markReady, { once: true });
    return () => {
      hidden.removeEventListener("canplay", markReady);
      hidden.removeEventListener("loadeddata", markReady);
    };
  }, [active, front, next, list]);

  useEffect(() => {
    if (list.length < 2 || !ready) return;
    const current = front === 0 ? frontRef.current : backRef.current;
    const hidden = front === 0 ? backRef.current : frontRef.current;
    if (!current || !hidden || !Number.isFinite(current.duration) || current.duration <= 0) return;

    const lead = 0.7;
    const remaining = Math.max(0.25, current.duration - current.currentTime - lead);
    const timer = window.setTimeout(() => {
      void hidden.play().catch(() => undefined);
      setFront(1 - front);
      setActive(next);
    }, remaining * 1000);

    return () => window.clearTimeout(timer);
  }, [active, front, next, ready, list]);

  if (!list.length) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg border border-gold/25 bg-ink shadow-elevated">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.22),transparent_35%),linear-gradient(135deg,#111,#000)]" />
        <div className="relative flex h-full items-center justify-center p-6 text-center">
          <div>
            <p className="eyebrow text-gold">LIGHT TERRA GROUP</p>
            <p className="mt-3 font-display text-xl text-white sm:text-2xl">Notre savoir-faire en mouvement</p>
            <p className="mt-2 text-sm text-white/60">La vidéo de présentation sera affichée ici dès qu’elle est ajoutée depuis l’administration.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-gold/25 bg-black shadow-elevated">
      {[0, 1].map((slot) => (
        <video
          key={slot}
          ref={slot === 0 ? frontRef : backRef}
          className={"absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out " + (slot === front ? "opacity-100" : "opacity-0")}
          muted
          playsInline
          preload="auto"
          aria-hidden={slot !== front}
        />
      ))}
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
        <div key={slide.id} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === index ? 1 : 0 }} aria-hidden={i !== index}>
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
        <div className="order-1">
          <p className="eyebrow text-gold">En images</p>
          <h2 className="mt-2 text-2xl text-ink-foreground lg:text-3xl">Notre savoir-faire en mouvement</h2>
          <div className="mt-5">
            <IntroVideoLoop />
          </div>
        </div>

        <div className="order-2">
          <p className="eyebrow text-gold">Bâtir la terre, éclairer l'avenir</p>
          <h1 key={index} className="animate-rise-in mt-4 text-4xl leading-tight text-ink-foreground lg:text-5xl">
            {list[index]?.title ?? "LIGHT TERRA GROUP"}
          </h1>
          {list[index]?.subtitle ? <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-foreground/80">{list[index]?.subtitle}</p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg"><Link to="/services">Demander un devis</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-gold/50 bg-transparent text-ink-foreground hover:bg-gold hover:text-ink">
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
                  className={i === index ? "h-1 w-12 rounded-full bg-gold-gradient" : "h-1 w-6 rounded-full bg-ink-foreground/30 transition hover:bg-ink-foreground/60"}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="relative z-10 mx-auto mt-2 w-full max-w-7xl px-5 lg:px-8"><MediaGallery /></div>
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

function VideoShowcase() {
  const { data: videos } = useQuery(showcaseVideosQuery);
  const { data: projects } = useQuery(projectsQuery);
  const [index, setIndex] = useState(0);
  const videoList = videos ?? [];
  const projectList = (projects ?? []).slice(0, 4);

  useEffect(() => {
    const length = videoList.length || projectList.length;
    if (length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % length), 8500);
    return () => window.clearInterval(timer);
  }, [videoList.length, projectList.length]);

  if (!videoList.length && !projectList.length) return null;

  const useVideos = videoList.length > 0;
  const length = useVideos ? videoList.length : projectList.length;
  const safeIndex = index % length;
  const videoItem = useVideos ? videoList[safeIndex] : null;
  const projectItem = !useVideos ? projectList[safeIndex] : null;

  return (
    <section className="bg-muted/40 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="eyebrow">Projets en images</p>
          <h2 className="mt-3 text-3xl lg:text-4xl">Découvrez nos opportunités et réalisations</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Présentations immersives, vues aériennes et contenus de projet. Les vidéos ajoutées depuis l’administration prennent automatiquement la place des visuels de secours.
          </p>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-ink shadow-elevated">
          <div className="relative aspect-video sm:aspect-[16/8]">
            {useVideos
              ? videoList.map((video, i) => (
                  <video
                    key={video.id}
                    src={video.video_url}
                    className={"absolute inset-0 h-full w-full object-cover transition-opacity duration-700 " + (i === safeIndex ? "opacity-100" : "opacity-0")}
                    muted
                    playsInline
                    autoPlay={i === safeIndex}
                    loop
                    preload={i === safeIndex ? "auto" : "metadata"}
                    aria-hidden={i !== safeIndex}
                  />
                ))
              : projectList.map((project, i) => (
                  <img
                    key={project.id}
                    src={project.image_url ?? "/media/hero1.jpg"}
                    alt={project.title}
                    className={"absolute inset-0 h-full w-full object-cover transition-opacity duration-700 " + (i === safeIndex ? "opacity-100" : "opacity-0")}
                    aria-hidden={i !== safeIndex}
                  />
                ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                {useVideos ? videoItem?.label : "Projet"}
              </p>
              <h3 className="mt-2 max-w-2xl text-2xl text-white sm:text-3xl lg:text-4xl">
                {useVideos ? (videoItem?.title || videoItem?.label) : projectItem?.title}
              </h3>
              {(useVideos ? videoItem?.description : projectItem?.summary) ? (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                  {useVideos ? videoItem?.description : projectItem?.summary}
                </p>
              ) : null}
            </div>
          </div>

          {length > 1 ? (
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-3 sm:px-5">
              <button type="button" onClick={() => setIndex((i) => (i - 1 + length) % length)} className="rounded-full bg-black/45 px-3 py-2 text-xl text-white backdrop-blur transition hover:bg-black/70" aria-label="Élément précédent">‹</button>
              <button type="button" onClick={() => setIndex((i) => (i + 1) % length)} className="rounded-full bg-black/45 px-3 py-2 text-xl text-white backdrop-blur transition hover:bg-black/70" aria-label="Élément suivant">›</button>
            </div>
          ) : null}

          {length > 1 ? (
            <div className="absolute bottom-4 right-5 flex gap-2">
              {Array.from({ length }).map((_, i) => (
                <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Afficher l’élément ${i + 1}`} className={"h-1.5 rounded-full transition-all " + (i === safeIndex ? "w-10 bg-gold" : "w-4 bg-white/45 hover:bg-white/75")} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

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
            <article key={activity.id} className="group rounded-lg border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-elevated">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-accent text-gold-deep"><Icon className="h-6 w-6" /></span>
              <h3 className="mt-5 text-xl">{activity.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{activity.short_description}</p>
            </article>
          );
        })}
      </div>
      <div className="mt-10"><Button asChild variant="outline"><Link to="/activites">Découvrir nos activités <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
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
              {project.image_url ? <img src={project.image_url} alt={project.title} loading="lazy" className="aspect-[4/3] w-full object-cover" /> : null}
              <div className="p-6">
                <p className="eyebrow">{project.category ?? "Projet"}</p>
                <h3 className="mt-2 text-lg">{project.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10"><Button asChild variant="gold"><Link to="/projets">Tous nos projets</Link></Button></div>
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
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{formatDateFr(item.published_at ?? item.created_at)}</p>
            <h3 className="mt-3 text-lg">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>
          </article>
        ))}
      </div>
      <div className="mt-10"><Button asChild variant="outline"><Link to="/actualites">Toutes les actualités</Link></Button></div>
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
          <p className="mt-4 max-w-xl text-ink-foreground/70">Nos équipes vous accompagnent de l'étude à la livraison. Décrivez votre besoin, nous revenons vers vous rapidement.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="gold" size="lg"><Link to="/services">Demander un devis</Link></Button>
          {company?.phone_primary ? (
            <Button asChild size="lg" variant="outline" className="border-gold/50 bg-transparent text-ink-foreground hover:bg-gold hover:text-ink">
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
        <VideoShowcase />
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

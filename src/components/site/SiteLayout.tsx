import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, Mail, MapPin, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import logoAsset from "@/assets/logo-light-terra.png.asset.json";
import { companyQuery, partnersQuery } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { AiAssistant } from "@/components/site/AiAssistant";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/a-propos", label: "À propos" },
  { to: "/activites", label: "Nos activités" },
  { to: "/projets", label: "Projets" },
  { to: "/services", label: "Services & devis" },
  { to: "/actualites", label: "Actualités" },
  { to: "/temoignages", label: "Témoignages" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "bg-ink/95 backdrop-blur-md shadow-elevated" : "bg-gradient-to-b from-ink/80 to-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="LIGHT TERRA GROUP — accueil">
          <img
            src={logoAsset.url}
            alt="Logo LIGHT TERRA GROUP"
            className="h-11 w-auto lg:h-14"
            width={1536}
            height={1024}
          />
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[0.82rem] font-medium uppercase tracking-[0.12em] text-ink-foreground/75 transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
            <Link to="/services">Demander un devis</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-gold/40 text-gold xl:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-gold/20 bg-ink/98 backdrop-blur-md xl:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="border-b border-white/5 py-3 text-sm uppercase tracking-[0.14em] text-ink-foreground/80"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="gold" className="mt-4">
              <Link to="/services">Demander un devis</Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function PartnersStrip() {
  const { data: partners } = useQuery(partnersQuery);
  if (!partners || partners.length === 0) return null;

  return (
    <section className="border-t border-border bg-background py-14">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="eyebrow text-center">Ils nous font confiance</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {partners.map((partner) => {
            const inner = partner.logo_url ? (
              <img
                src={partner.logo_url}
                alt={partner.name}
                loading="lazy"
                className="h-12 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            ) : (
              <span className="font-display text-lg text-muted-foreground">{partner.name}</span>
            );
            return partner.website_url ? (
              <a key={partner.id} href={partner.website_url} target="_blank" rel="noreferrer noopener">
                {inner}
              </a>
            ) : (
              <div key={partner.id}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const { data: company } = useQuery(companyQuery);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-gradient text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <img
            src={logoAsset.url}
            alt="Logo LIGHT TERRA GROUP"
            loading="lazy"
            className="h-20 w-auto"
            width={1536}
            height={1024}
          />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-foreground/70">
            {company?.description ??
              "LIGHT TERRA GROUP valorise la terre et transforme les opportunités foncières en projets d'avenir."}
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg text-gold">Navigation</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/70">
            {NAV.slice(1).map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg text-gold">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-foreground/70">
            {company?.phone_primary ? (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={`tel:${company.phone_primary}`}>{company.phone_primary}</a>
              </li>
            ) : null}
            {company?.email ? (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </li>
            ) : null}
            {company?.address || company?.city ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{[company?.address, company?.city, company?.country].filter(Boolean).join(", ")}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-ink-foreground/50 sm:flex-row lg:px-8">
          <p>
            © {year} {company?.name ?? "LIGHT TERRA GROUP"} — Tous droits réservés.
          </p>
          <p className="uppercase tracking-[0.2em] text-gold/80">
            {company?.slogan ?? "Bâtir la terre, éclairer l'avenir"}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({
  children,
  withPartners = true,
}: {
  children: ReactNode;
  withPartners?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {withPartners ? <PartnersStrip /> : null}
      <SiteFooter />
      <AiAssistant />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="bg-ink-gradient pb-16 pt-32 text-ink-foreground lg:pb-20 lg:pt-40">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight lg:text-6xl">{title}</h1>
        <hr className="gold-rule mt-6 w-24" />
        {description ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-foreground/70">{description}</p>
        ) : null}
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { mediaItemsQuery } from "@/lib/site-data";

/** Carrousel unique mêlant photos et vidéos, alimenté depuis l'administration. */
export function MediaGallery() {
  const { data } = useQuery(mediaItemsQuery);
  const items = data ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    if (items[index]?.kind === "video") return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearTimeout(t);
  }, [index, items]);

  if (items.length === 0) return null;
  const current = items[index]!;

  return (
    <section className="border-t border-border bg-secondary py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="eyebrow">Nos réalisations en photos & vidéos</p>
        <h2 className="mt-3 text-3xl lg:text-4xl">Galerie</h2>
        <hr className="gold-rule mt-5 w-20" />

        <div className="relative mt-8 overflow-hidden rounded-lg border border-gold/25 bg-ink shadow-elevated">
          {current.kind === "video" ? (
            <video
              key={current.id}
              src={current.url}
              poster={current.poster_url ?? undefined}
              className="aspect-video w-full bg-black object-cover"
              controls
              muted
              playsInline
              autoPlay
              onEnded={() => setIndex((i) => (i + 1) % items.length)}
            />
          ) : (
            <img
              key={current.id}
              src={current.url}
              alt={current.title ?? "Réalisation LIGHT TERRA GROUP"}
              loading="lazy"
              className="aspect-video w-full object-cover"
            />
          )}

          {items.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Élément précédent"
                onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
                className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 text-gold"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Élément suivant"
                onClick={() => setIndex((i) => (i + 1) % items.length)}
                className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 text-gold"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        {current.title ? (
          <p className="mt-4 text-sm text-muted-foreground">{current.title}</p>
        ) : null}

        <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={item.title ?? `Élément ${i + 1}`}
              className={
                i === index
                  ? "h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 border-gold"
                  : "h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border opacity-70"
              }
            >
              <img
                src={item.kind === "video" ? (item.poster_url ?? "/media/hero1.jpg") : item.url}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

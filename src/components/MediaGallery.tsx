import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, X } from "lucide-react";
import { mediaItemsQuery } from "@/lib/site-data";

export function MediaGallery() {
  const { data, isLoading } = useQuery(mediaItemsQuery);
  const [selected, setSelected] = useState<number | null>(null);
  const items = useMemo(() => (data ?? []).filter((item) => item.url), [data]);

  if (isLoading || items.length === 0) return null;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 8).map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/15 bg-black/30 text-left shadow-elevated"
          >
            {item.kind === "video" ? (
              <>
                <video
                  src={item.url}
                  poster={item.poster_url ?? undefined}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur">
                  <Play className="h-4 w-4 fill-current" />
                </span>
              </>
            ) : (
              <img src={item.url} alt={item.title ?? "LIGHT TERRA GROUP"} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10 text-sm font-medium text-white">
              {item.title ?? (item.kind === "video" ? "Vidéo" : "Photo")}
            </span>
          </button>
        ))}
      </div>

      {selected !== null && items[selected] ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
          <div className="max-h-[90vh] max-w-6xl overflow-hidden rounded-xl bg-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {items[selected].kind === "video" ? (
              <video src={items[selected].url} poster={items[selected].poster_url ?? undefined} controls autoPlay playsInline className="max-h-[90vh] max-w-full" />
            ) : (
              <img src={items[selected].url} alt={items[selected].title ?? "LIGHT TERRA GROUP"} className="max-h-[90vh] max-w-full object-contain" />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

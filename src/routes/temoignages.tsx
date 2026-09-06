import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { formatDateFr, testimonialsQuery } from "@/lib/site-data";

const title = "Témoignages — LIGHT TERRA GROUP";
const description = "Les retours de nos clients et partenaires sur les projets menés par LIGHT TERRA GROUP.";

export const Route = createFileRoute("/temoignages")({
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
  const { data: testimonials } = useQuery(testimonialsQuery);
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const list = testimonials ?? [];

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const author_name = String(data.get("author_name") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (author_name.length < 2 || message.length < 5) {
      toast.error("Merci de renseigner votre nom et un message.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("testimonials").insert({
      author_name,
      author_role: String(data.get("author_role") ?? "").trim() || null,
      company: String(data.get("company") ?? "").trim() || null,
      message,
      rating,
      status: "en_attente",
      is_published: false,
    });
    setSending(false);
    if (error) {
      toast.error("Envoi impossible pour le moment. Merci de réessayer.");
      return;
    }
    form.reset();
    setRating(5);
    void queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    toast.success("Merci ! Votre témoignage sera publié après validation.");
  };

  return (
    <SiteLayout>
      <PageHero eyebrow="Témoignages" title="Ils nous ont fait confiance" description={description} />

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        {list.length === 0 ? (
          <p className="text-muted-foreground">
            Les premiers témoignages seront publiés très prochainement. Vous pouvez déjà partager le vôtre.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((item) => (
              <article key={item.id} className="rounded-lg border border-border bg-card p-6">
                <div className="flex gap-1">
                  {Array.from({ length: item.rating ?? 0 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">« {item.message} »</p>
                <p className="mt-5 font-display text-base">{item.author_name}</p>
                <p className="text-xs text-muted-foreground">
                  {[item.author_role, item.company].filter(Boolean).join(" — ")}
                </p>
                <p className="mt-2 text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground/70">
                  {formatDateFr(item.created_at)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <p className="eyebrow">Votre avis</p>
          <h2 className="mt-3 text-3xl">Laisser un témoignage</h2>
          <hr className="gold-rule mt-6 w-24" />
          <form onSubmit={onSubmit} className="mt-8 grid gap-5 rounded-lg border border-border bg-card p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="author_name">Nom complet *</Label>
                <Input id="author_name" name="author_name" required maxLength={120} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="author_role">Fonction</Label>
                <Input id="author_role" name="author_role" maxLength={120} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input id="company" name="company" maxLength={120} />
            </div>
            <div className="grid gap-2">
              <Label>Note</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                    onClick={() => setRating(value)}
                  >
                    <Star
                      className={
                        value <= rating ? "h-6 w-6 fill-gold text-gold" : "h-6 w-6 text-muted-foreground/40"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Votre message *</Label>
              <Textarea id="message" name="message" required rows={5} maxLength={2000} />
            </div>
            <Button type="submit" variant="gold" disabled={sending}>
              {sending ? "Envoi…" : "Envoyer mon témoignage"}
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

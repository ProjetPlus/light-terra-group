import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { submitRequest } from "@/lib/requests.functions";

const title = "Services & devis — LIGHT TERRA GROUP";
const description =
  "Demandez un devis personnalisé : aménagement foncier, BTP & VRD, immobilier, hydraulique et électrification.";

export const Route = createFileRoute("/services")({
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

const PROJECT_TYPES = [
  "Aménagement foncier / lotissement",
  "BTP & VRD",
  "Construction immobilière",
  "Hydraulique & adduction d'eau potable",
  "Électrification & infrastructures",
  "Topographie & études",
  "Autre",
];

const BUDGETS = [
  "Moins de 5 000 000 FCFA",
  "5 à 20 millions FCFA",
  "20 à 50 millions FCFA",
  "50 à 200 millions FCFA",
  "Plus de 200 millions FCFA",
  "À définir ensemble",
];

const field =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring";

function Page() {
  const send = useServerFn(submitRequest);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const value = (k: string) => String(fd.get(k) ?? "").trim();
    setLoading(true);
    try {
      const res = await send({
        data: {
          request_type: "devis" as const,
          full_name: value("full_name"),
          email: value("email"),
          phone: value("phone"),
          company: value("company"),
          subject: "Demande de devis",
          project_type: value("project_type"),
          budget_range: value("budget_range"),
          desired_date: value("desired_date"),
          message: value("message"),
        },
      });
      if (res.ok) {
        setDone(true);
        form.reset();
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Merci de vérifier les champs et de réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <PageHero eyebrow="Services & devis" title="Demandez votre devis" description={description} />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_1.2fr] lg:px-8 lg:py-20">
        <div>
          <h2 className="text-2xl">Nos prestations</h2>
          <hr className="gold-rule mt-4 w-16" />
          <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {PROJECT_TYPES.slice(0, 6).map((p) => (
              <li key={p} className="border-b border-border pb-3">
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Chaque demande est étudiée par nos équipes techniques. Vous recevez une proposition
            adaptée à votre projet, votre budget et vos délais.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm lg:p-8">
          {done ? (
            <div className="rounded-md border border-gold/40 bg-muted p-6">
              <h3 className="font-display text-xl">Demande envoyée</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Merci ! Votre demande de devis a bien été transmise à nos équipes. Nous revenons
                vers vous très rapidement.
              </p>
              <Button className="mt-5" variant="gold" onClick={() => setDone(false)}>
                Envoyer une autre demande
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm">
                  Nom et prénoms *
                  <input name="full_name" required minLength={2} maxLength={120} className={field} />
                </label>
                <label className="text-sm">
                  E-mail *
                  <input name="email" type="email" required className={field} />
                </label>
                <label className="text-sm">
                  Téléphone
                  <input name="phone" className={field} />
                </label>
                <label className="text-sm">
                  Entreprise / structure
                  <input name="company" className={field} />
                </label>
                <label className="text-sm">
                  Type de projet *
                  <select name="project_type" required className={field} defaultValue="">
                    <option value="" disabled>
                      Choisir…
                    </option>
                    {PROJECT_TYPES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Budget estimé
                  <select name="budget_range" className={field} defaultValue="">
                    <option value="">Non précisé</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm sm:col-span-2">
                  Date souhaitée de démarrage
                  <input name="desired_date" type="date" className={field} />
                </label>
              </div>
              <label className="block text-sm">
                Décrivez votre projet *
                <textarea name="message" required minLength={5} maxLength={5000} rows={6} className={field} />
              </label>
              <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full">
                {loading ? "Envoi en cours…" : "Envoyer ma demande de devis"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Vos informations sont utilisées uniquement pour traiter votre demande.
              </p>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

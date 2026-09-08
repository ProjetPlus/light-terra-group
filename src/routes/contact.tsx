import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { WHATSAPP_NUMBERS } from "@/lib/media";
import { submitRequest } from "@/lib/requests.functions";

const title = "Contact — LIGHT TERRA GROUP";
const description =
  "Contactez LIGHT TERRA GROUP à Abidjan : téléphone, WhatsApp, e-mail, adresse du siège social et formulaire de contact.";

export const Route = createFileRoute("/contact")({
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

const field =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring";

function Page() {
  const send = useServerFn(submitRequest);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const value = (k: string) => String(fd.get(k) ?? "").trim();
    setLoading(true);
    try {
      const res = await send({
        data: {
          request_type: "contact" as const,
          full_name: value("full_name"),
          email: value("email"),
          phone: value("phone"),
          company: "",
          subject: value("subject"),
          project_type: "",
          budget_range: "",
          desired_date: "",
          message: value("message"),
        },
      });
      if (res.ok) {
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
      <PageHero eyebrow="Contact" title="Nous contacter" description={description} />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div>
          <h2 className="text-2xl">Nos coordonnées</h2>
          <hr className="gold-rule mt-4 w-16" />
          <ul className="mt-6 space-y-5 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
              <a href="tel:+2250749224722" className="hover:text-foreground">
                +225 07 49 22 47 22
              </a>
            </li>
            {WHATSAPP_NUMBERS.map((w) => (
              <li key={w.link} className="flex gap-3">
                <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
                <a
                  href={`https://wa.me/${w.link}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-foreground"
                >
                  {w.label} : {w.display}
                </a>
              </li>
            ))}
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
              <a href="mailto:contact@lightterragroup.com" className="hover:text-foreground">
                contact@lightterragroup.com
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
              <span>
                Siège social : Abidjan Cocody Akouédo extension sud-est, Lot 637, îlot 60 ; 01 BP
                2259 Abidjan 01
              </span>
            </li>
          </ul>

          <div className="mt-8 overflow-hidden rounded-lg border border-border">
            <iframe
              title="Localisation LIGHT TERRA GROUP"
              src="https://www.google.com/maps?q=Cocody%20Akou%C3%A9do%20Abidjan&output=embed"
              className="h-64 w-full"
              loading="lazy"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm lg:p-8">
          <h2 className="text-2xl">Écrivez-nous</h2>
          <hr className="gold-rule mt-4 w-16" />
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
                Objet
                <input name="subject" maxLength={200} className={field} />
              </label>
            </div>
            <label className="block text-sm">
              Message *
              <textarea name="message" required minLength={5} maxLength={5000} rows={6} className={field} />
            </label>
            <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full">
              {loading ? "Envoi en cours…" : "Envoyer le message"}
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

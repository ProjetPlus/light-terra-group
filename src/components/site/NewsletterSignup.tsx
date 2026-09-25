import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { Button } from "@/components/ui/button";

export function NewsletterSignup() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await subscribe({ data: { fullName, email, phone } });
      toast.success(result.message);
      if (!result.alreadySubscribed) {
        setFullName("");
        setEmail("");
        setPhone("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Inscription impossible.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="bg-ink py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <p className="eyebrow text-gold">Newsletter LT GROUP</p>
            <h2 className="mt-3 text-3xl text-white lg:text-4xl">Restez informé de nos projets et opportunités.</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
              Recevez nos principales actualités directement par e-mail, avec un accès immédiat aux publications et informations importantes du groupe.
            </p>
          </div>
          <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-5 sm:grid-cols-2 sm:p-7">
            <label className="sm:col-span-2"><span className="sr-only">Nom complet</span><div className="flex items-center rounded-lg border border-white/15 bg-white/5 px-3"><UserRound className="mr-2 h-4 w-4 text-gold" /><input required minLength={2} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nom et prénom" className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-white/40" /></div></label>
            <label><span className="sr-only">E-mail</span><div className="flex items-center rounded-lg border border-white/15 bg-white/5 px-3"><Mail className="mr-2 h-4 w-4 text-gold" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adresse e-mail" className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-white/40" /></div></label>
            <label><span className="sr-only">Téléphone</span><div className="flex items-center rounded-lg border border-white/15 bg-white/5 px-3"><Phone className="mr-2 h-4 w-4 text-gold" /><input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Numéro de téléphone" className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-white/40" /></div></label>
            <div className="sm:col-span-2"><Button type="submit" variant="gold" disabled={pending} className="w-full">{pending ? "Inscription…" : "S'abonner à la newsletter"}</Button><p className="mt-3 text-center text-[11px] leading-relaxed text-white/45">En vous inscrivant, vous acceptez de recevoir les communications d'information de LT GROUP. Vous pourrez demander votre désinscription à tout moment.</p></div>
          </form>
        </div>
      </div>
    </section>
  );
}

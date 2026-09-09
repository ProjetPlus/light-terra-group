import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LOGO_URL } from "@/lib/media";

export const Route = createFileRoute("/me")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Espace réservé — LIGHT TERRA GROUP" },
      { name: "description", content: "Accès réservé à l'équipe LIGHT TERRA GROUP." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Espace réservé — LIGHT TERRA GROUP" },
      { property: "og:description", content: "Accès réservé à l'équipe LIGHT TERRA GROUP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

const field =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring";

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/admin" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email") ?? "").trim(),
      password: String(fd.get("password") ?? ""),
    });
    setLoading(false);
    if (error) {
      toast.error("Identifiants incorrects.");
      return;
    }
    toast.success("Connexion réussie.");
    void navigate({ to: "/admin" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-gradient px-5 py-16">
      <div className="w-full max-w-md rounded-lg border border-gold/30 bg-card p-8 shadow-elevated">
        <img src={LOGO_URL} alt="LIGHT TERRA GROUP" className="mx-auto h-16 w-auto" />
        <h1 className="mt-6 text-center text-2xl">Espace réservé</h1>
        <hr className="gold-rule mx-auto mt-4 w-16" />
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            E-mail
            <input name="email" type="email" required autoComplete="email" className={field} />
          </label>
          <label className="block text-sm">
            Mot de passe
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={field}
            />
          </label>
          <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full">
            {loading ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  );
}

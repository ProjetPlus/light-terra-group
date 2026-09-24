import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LOGO_URL } from "@/lib/media";
import { activitiesQuery, formatDateFr } from "@/lib/site-data";
import { replyToMessage } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Tableau de bord — LIGHT TERRA GROUP" },
      { name: "description", content: "Administration du site LIGHT TERRA GROUP." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Tableau de bord — LIGHT TERRA GROUP" },
      { property: "og:description", content: "Administration du site LIGHT TERRA GROUP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Row = Record<string, unknown>;

type FieldKind = "text" | "textarea" | "number" | "boolean" | "select" | "file";
type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  options?: string[];
  required?: boolean;
  accept?: string;
};

type TableDef = {
  key: string;
  label: string;
  table: "hero_slides" | "activities" | "news" | "projects" | "testimonials" | "partners" | "media_items" | "intro_videos" | "company_info" | "ai_knowledge";
  order: { column: string; ascending: boolean };
  columns: string[];
  fields: FieldDef[];
  create: boolean;
};

const TABLES: TableDef[] = [
  {
    key: "hero_slides", label: "Accueil — visuels", table: "hero_slides",
    order: { column: "position", ascending: true },
    columns: ["title", "position", "is_active"], create: true,
    fields: [
      { name: "title", label: "Titre", kind: "text" },
      { name: "subtitle", label: "Sous-titre", kind: "textarea" },
      { name: "image_url", label: "Visuel", kind: "file", required: true, accept: "image/*" },
      { name: "cta_label", label: "Bouton", kind: "text" },
      { name: "cta_url", label: "Lien du bouton", kind: "text" },
      { name: "duration_ms", label: "Durée (ms)", kind: "number" },
      { name: "position", label: "Ordre", kind: "number" },
      { name: "is_active", label: "Actif", kind: "boolean" },
    ],
  },
  {
    key: "activities", label: "Pôles d'activité", table: "activities",
    order: { column: "position", ascending: true },
    columns: ["title", "slug", "position", "is_active"], create: true,
    fields: [
      { name: "title", label: "Titre", kind: "text", required: true },
      { name: "slug", label: "Identifiant", kind: "text", required: true },
      { name: "short_description", label: "Résumé", kind: "textarea", required: true },
      { name: "description", label: "Description", kind: "textarea" },
      { name: "icon", label: "Icône", kind: "text" },
      { name: "image_url", label: "Image", kind: "file", accept: "image/*" },
      { name: "position", label: "Ordre", kind: "number" },
      { name: "is_active", label: "Actif", kind: "boolean" },
    ],
  },

  {
    key: "company_info", label: "Informations du groupe", table: "company_info",
    order: { column: "updated_at", ascending: false },
    columns: ["name", "email", "phone_primary", "city"], create: true,
    fields: [
      { name: "name", label: "Nom", kind: "text", required: true },
      { name: "slogan", label: "Slogan", kind: "text", required: true },
      { name: "description", label: "Description", kind: "textarea" },
      { name: "phone_primary", label: "Téléphone principal", kind: "text" },
      { name: "phone_secondary", label: "Téléphone secondaire", kind: "text" },
      { name: "whatsapp", label: "WhatsApp", kind: "text" },
      { name: "email", label: "E-mail", kind: "text" },
      { name: "address", label: "Adresse", kind: "text" },
      { name: "city", label: "Ville", kind: "text" },
      { name: "country", label: "Pays", kind: "text" },
      { name: "opening_hours", label: "Horaires", kind: "text" },
      { name: "website", label: "Site web", kind: "text" },
      { name: "facebook_url", label: "Facebook", kind: "text" },
      { name: "linkedin_url", label: "LinkedIn", kind: "text" },
      { name: "instagram_url", label: "Instagram", kind: "text" },
    ],
  },
  {
    key: "ai_knowledge", label: "Raï — base de connaissances", table: "ai_knowledge",
    order: { column: "position", ascending: true },
    columns: ["question", "answer", "is_active"], create: true,
    fields: [
      { name: "question", label: "Question", kind: "text", required: true },
      { name: "answer", label: "Réponse", kind: "textarea", required: true },
      { name: "position", label: "Ordre", kind: "number" },
      { name: "is_active", label: "Actif", kind: "boolean" },
    ],
  },
  {
    key: "intro_videos", label: "Vidéos accueil", table: "intro_videos",
    order: { column: "position", ascending: true },
    columns: ["label", "placement", "title", "position", "is_active"], create: true,
    fields: [
      { name: "label", label: "Nom interne", kind: "text", required: true },
      { name: "title", label: "Titre affiché", kind: "text" },
      { name: "description", label: "Description", kind: "textarea" },
      { name: "placement", label: "Emplacement", kind: "select", options: ["hero_intro", "home_showcase"] },
      { name: "video_url", label: "Vidéo", kind: "file", required: true, accept: "video/mp4,video/webm,video/quicktime" },
      { name: "cta_label", label: "Bouton", kind: "text" },
      { name: "cta_url", label: "Lien", kind: "text" },
      { name: "position", label: "Ordre dans la section", kind: "number" },
      { name: "is_active", label: "Active", kind: "boolean" },
    ],
  },

  {
    key: "news", label: "Actualités", table: "news",
    order: { column: "created_at", ascending: false },
    columns: ["title", "author", "published_at", "is_published"], create: true,
    fields: [
      { name: "title", label: "Titre", kind: "text", required: true },
      { name: "slug", label: "Identifiant", kind: "text", required: true },
      { name: "excerpt", label: "Résumé", kind: "textarea" },
      { name: "content", label: "Contenu", kind: "textarea" },
      { name: "image_url", label: "Image de couverture", kind: "file", accept: "image/*" },
      { name: "author", label: "Auteur", kind: "text" },
      { name: "published_at", label: "Date de publication", kind: "text" },
      { name: "is_published", label: "Publiée", kind: "boolean" },
    ],
  },
  {
    key: "projects", label: "Projets", table: "projects",
    order: { column: "position", ascending: true },
    columns: ["title", "category", "status", "is_published"], create: true,
    fields: [
      { name: "title", label: "Titre", kind: "text", required: true },
      { name: "slug", label: "Identifiant", kind: "text", required: true },
      { name: "summary", label: "Résumé", kind: "textarea" },
      { name: "content", label: "Description", kind: "textarea" },
      { name: "image_url", label: "Photo", kind: "file", accept: "image/*" },
      { name: "category", label: "Pôle d'activité", kind: "select" },
      { name: "location", label: "Localisation", kind: "text" },
      { name: "status", label: "État", kind: "select", options: ["en_cours", "termine", "a_venir"] },
      { name: "position", label: "Ordre", kind: "number" },
      { name: "is_featured", label: "Mise en avant", kind: "boolean" },
      { name: "is_published", label: "Publié", kind: "boolean" },
    ],
  },
  {
    key: "testimonials", label: "Témoignages", table: "testimonials",
    order: { column: "created_at", ascending: false },
    columns: ["author_name", "company", "status", "is_published"], create: false,
    fields: [
      { name: "status", label: "Modération", kind: "select", options: ["en_attente", "valide", "refuse"] },
      { name: "is_published", label: "Publier", kind: "boolean" },
    ],
  },
  {
    key: "partners", label: "Partenaires", table: "partners",
    order: { column: "position", ascending: true },
    columns: ["name", "is_active"], create: true,
    fields: [
      { name: "name", label: "Nom", kind: "text", required: true },
      { name: "logo_url", label: "Logo", kind: "file", accept: "image/*" },
      { name: "website_url", label: "Site web", kind: "text" },
      { name: "position", label: "Ordre", kind: "number" },
      { name: "is_active", label: "Actif", kind: "boolean" },
    ],
  },
  {
    key: "media", label: "Photos & vidéos", table: "media_items",
    order: { column: "position", ascending: true },
    columns: ["title", "kind", "is_active"], create: true,
    fields: [
      { name: "kind", label: "Type", kind: "select", options: ["photo", "video"], required: true },
      { name: "title", label: "Titre", kind: "text" },
      { name: "description", label: "Description", kind: "textarea" },
      { name: "url", label: "Fichier", kind: "file", required: true },
      { name: "poster_url", label: "Image de couverture (vidéo)", kind: "file", accept: "image/*" },
      { name: "position", label: "Ordre", kind: "number" },
      { name: "is_active", label: "Actif", kind: "boolean" },
    ],
  },
];

const field =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function todayIsoDate() { return new Date().toISOString().slice(0, 10); }

function safeFileName(name: string) {
  const ext = name.includes(".") ? "." + name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base = name.replace(/\.[^/.]+$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  return (base || "fichier") + "-" + crypto.randomUUID() + ext;
}

async function uploadSiteFile(file: File, folder: string) {
  if (file.size > 50 * 1024 * 1024) throw new Error("Fichier trop volumineux (50 Mo maximum).");
  const allowed = /^(image\/(jpeg|png|webp|gif|svg\+xml)|video\/(mp4|webm|quicktime))$/i;
  if (!allowed.test(file.type)) throw new Error("Format non pris en charge. Utilisez une image ou une vidéo web.");
  const path = folder + "/" + safeFileName(file.name);
  const { error } = await supabase.storage.from("site-media").upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
}

function newRowFor(def: TableDef, rows: Row[]) {
  const row: Row = {};
  const first = rows.length ? Math.min(...rows.map((r) => Number(r["position"] ?? 0))) - 1 : 0;
  if (def.table === "news") Object.assign(row, { author: "LT Group", published_at: todayIsoDate(), is_published: false });
  if (def.table === "projects") Object.assign(row, { position: first, status: "en_cours", is_published: false, is_featured: false });
  if (def.table === "partners") Object.assign(row, { position: first, is_active: true });
  if (def.table === "media_items") Object.assign(row, { kind: "photo", position: first, is_active: true });
  if (def.table === "intro_videos") Object.assign(row, { position: first, placement: "home_showcase", is_active: true });
  if (def.table === "hero_slides") Object.assign(row, { position: first, duration_ms: 6000, is_active: true });
  if (def.table === "activities") Object.assign(row, { position: first, is_active: true });
  if (def.table === "ai_knowledge") Object.assign(row, { position: first, is_active: true });
  if (def.table === "company_info") Object.assign(row, { name: "LIGHT TERRA GROUP", slogan: "Bâtir la terre, éclairer l’avenir" });
  return row;
}

function AdminPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState("messages");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        void navigate({ to: "/me" });
        return;
      }
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
      if (!role) {
        toast.error("Accès réservé aux administrateurs.");
        await supabase.auth.signOut();
        void navigate({ to: "/me" });
        return;
      }
      setEmail(data.user.email ?? null);
      setReady(true);
    })();
    return () => { active = false; };
  }, [navigate]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Chargement…</div>;

  const selectTab = (value: string) => {
    setTab(value);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      <aside className={"fixed inset-y-0 left-0 z-50 w-[280px] border-r border-white/10 bg-[#0b1f18] text-ink-foreground transition-transform lg:translate-x-0 " + (mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-full flex-col shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <img src={LOGO_URL} alt="LIGHT TERRA GROUP" className="h-10 w-auto" />
            <button type="button" className="rounded-md p-2 hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-gold">Administration</p>
            <p className="mt-1 truncate text-xs text-ink-foreground/60">{email}</p>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-5">
            <SidebarItem active={tab === "messages"} onClick={() => selectTab("messages")}>Demandes</SidebarItem>
            {TABLES.map((t) => <SidebarItem key={t.key} active={tab === t.key} onClick={() => selectTab(t.key)}>{t.label}</SidebarItem>)}
          </nav>
          <div className="border-t border-white/10 p-4">
            <Button variant="outline" className="w-full border-white/20 bg-transparent text-ink-foreground hover:bg-white/10" onClick={async () => { await supabase.auth.signOut(); void navigate({ to: "/me" }); }}>
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {mobileOpen ? <button type="button" className="fixed inset-0 z-40 bg-black/50 lg:hidden" aria-label="Fermer le menu" onClick={() => setMobileOpen(false)} /> : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-5 py-3 lg:px-8">
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-md border border-border p-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">LIGHT TERRA GROUP</p>
                <h1 className="text-lg">{TABLES.find((t) => t.key === tab)?.label ?? "Demandes"}</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10">
          {tab === "messages" ? <DashboardOverview onSelect={selectTab} /> : <CrudPanel def={TABLES.find((t) => t.key === tab)!} />}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={"group flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition-all " + (active ? "bg-gold text-ink font-semibold shadow-lg shadow-gold/10" : "text-ink-foreground/70 hover:bg-white/8 hover:text-white")}
    >
      {children}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink"
          : "rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}

type Message = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  request_type: string;
  subject: string | null;
  project_type: string | null;
  budget_range: string | null;
  desired_date: string | null;
  message: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

function DashboardOverview({ onSelect }: { onSelect: (key: string) => void }) {
  const queries = [
    ["Demandes", "messages"],
    ["Actualités", "news"],
    ["Projets", "projects"],
    ["Photos & vidéos", "media_items"],
    ["Témoignages", "testimonials"],
    ["Partenaires", "partners"],
  ] as const;
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Vue d'ensemble</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Bienvenue dans votre espace d'administration</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">Publiez, organisez et modérez le contenu du site depuis un seul espace. Les fichiers sont téléversés directement, sans copier de liens.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {queries.map(([label, key]) => <DashboardCard key={key} label={label} table={key} onClick={() => onSelect(key)} />)}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold">Flux de publication</p>
        <p className="mt-1 text-sm text-slate-500">Les éléments publiés apparaissent automatiquement sur les sections publiques correspondantes.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">1</p><p className="mt-1 text-sm font-medium">Téléverser</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">2</p><p className="mt-1 text-sm font-medium">Activer / publier</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">3</p><p className="mt-1 text-sm font-medium">Visible sur le site</p></div>
        </div>
      </div>
    </div>
  );
}
function DashboardCard({ label, table, onClick }: { label: string; table: TableDef["table"] | "messages"; onClick?: () => void }) {
  const { data } = useQuery({
    queryKey: ["admin", "count", table],
    queryFn: async () => {
      const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
      if (error) return 0;
      return count ?? 0;
    },
  });
  return <button type="button" onClick={onClick} className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gold"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{data ?? "—"}</p><p className="mt-1 text-xs text-slate-400">élément(s) — ouvrir</p></button>;
}

function MessagesPanel() {
  const qc = useQueryClient();
  const reply = useServerFn(replyToMessage);
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Message[];
    },
  });

  const send = useMutation({
    mutationFn: async (vars: { messageId: string; reply: string }) => reply({ data: vars }),
    onSuccess: (res) => {
      toast.success(res.message);
      setOpenId(null);
      setText("");
      void qc.invalidateQueries({ queryKey: ["admin", "messages"] });
    },
    onError: () => toast.error("La réponse n'a pas pu être envoyée."),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  const list = data ?? [];
  if (list.length === 0)
    return <p className="text-sm text-muted-foreground">Aucune demande pour le moment.</p>;

  return (
    <div className="space-y-4">
      {list.map((m) => (
        <article key={m.id} className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg">
                {m.full_name}{" "}
                <span className="text-xs uppercase tracking-[0.14em] text-gold-deep">
                  {m.request_type}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">{formatDateFr(m.created_at)}</p>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs">{m.status}</span>
          </div>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <Info label="E-mail" value={m.email} href={`mailto:${m.email}`} />
            {m.phone ? (
              <Info label="Téléphone" value={m.phone} href={`tel:${m.phone.replace(/\s/g, "")}`} />
            ) : null}
            {m.company ? <Info label="Structure" value={m.company} /> : null}
            {m.project_type ? <Info label="Type de projet" value={m.project_type} /> : null}
            {m.budget_range ? <Info label="Budget" value={m.budget_range} /> : null}
            {m.desired_date ? <Info label="Date souhaitée" value={m.desired_date} /> : null}
          </dl>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {m.message}
          </p>

          {m.admin_reply ? (
            <div className="mt-4 rounded-md border border-gold/40 bg-muted p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-gold-deep">
                Réponse envoyée {m.replied_at ? `le ${formatDateFr(m.replied_at)}` : ""}
              </p>
              <p className="mt-2 whitespace-pre-line">{m.admin_reply}</p>
            </div>
          ) : null}

          {openId === m.id ? (
            <div className="mt-4">
              <textarea
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Votre réponse…"
                className={field}
              />
              <div className="mt-3 flex gap-2">
                <Button
                  variant="gold"
                  disabled={send.isPending || text.trim().length < 2}
                  onClick={() => send.mutate({ messageId: m.id, reply: text.trim() })}
                >
                  {send.isPending ? "Envoi…" : "Envoyer la réponse"}
                </Button>
                <Button variant="outline" onClick={() => setOpenId(null)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="mt-4"
              variant="gold"
              size="sm"
              onClick={() => {
                setOpenId(m.id);
                setText(m.admin_reply ?? "");
              }}
            >
              Répondre
            </Button>
          )}
        </article>
      ))}
    </div>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">
        {href ? (
          <a href={href} className="text-gold-deep hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function CrudPanel({ def }: { def: TableDef }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("tous");
  const queryKey = useMemo(() => ["admin", def.table], [def.table]);
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase.from(def.table).select("*").order(def.order.column, { ascending: def.order.ascending });
      if (error) throw new Error(error.message);
      return (data ?? []) as Row[];
    },
  });
  const { data: activities } = useQuery(activitiesQuery);
  const rows = data ?? [];
  const visibleRows = def.table === "testimonials" && statusFilter !== "tous" ? rows.filter((r) => String(r["status"] ?? "") === statusFilter) : rows;
  const categoryOptions = (activities ?? []).map((a) => a.title);

  const save = useMutation({
    mutationFn: async (row: Row) => {
      const id = row["id"] as string | undefined;
      const payload: Row = {};
      for (const f of def.fields) payload[f.name] = row[f.name] ?? null;
      for (const f of def.fields) if (f.required && (payload[f.name] === null || payload[f.name] === undefined || payload[f.name] === "")) throw new Error("Le champ « " + f.label + " » est obligatoire.");
      if ((def.table === "news" || def.table === "projects") && !payload["slug"]) payload["slug"] = slugify(String(payload["title"] ?? ""));
      if (def.table === "news") { payload["author"] = "LT Group"; if (!payload["published_at"]) payload["published_at"] = todayIsoDate(); }
      if (!id && (def.table === "projects" || def.table === "partners" || def.table === "media_items" || def.table === "intro_videos")) {
        const { data: firstRow } = await supabase.from(def.table).select("position").order("position", { ascending: true }).limit(1).maybeSingle();
        payload["position"] = firstRow?.position == null ? 0 : Number(firstRow["position"]) - 1;
      }
      const result = id
        ? await supabase.from(def.table).update(payload as never).eq("id", id)
        : await supabase.from(def.table).insert(payload as never);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: () => { toast.success("Enregistré."); setEditing(null); void qc.invalidateQueries({ queryKey }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from(def.table).delete().eq("id", id); if (error) throw new Error(error.message); },
    onSuccess: () => { toast.success("Supprimé."); void qc.invalidateQueries({ queryKey }); },
    onError: (e: Error) => toast.error(e.message),
  });
  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div><p className="eyebrow">{def.table === "testimonials" ? "Modération" : "Gestion de contenu"}</p><h2 className="mt-1 text-2xl">{def.label}</h2></div>
        {def.create ? <Button variant="gold" size="sm" onClick={() => setEditing(newRowFor(def, rows))}>Ajouter</Button> : null}
      </div>
      {editing ? (
        <form className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
          {def.table === "testimonials" ? <div className="sm:col-span-2 rounded-md bg-muted p-4 text-sm"><p className="font-medium">{String(editing["author_name"] ?? "")}</p><p className="mt-1 text-muted-foreground">{String(editing["message"] ?? "")}</p><p className="mt-2 text-xs text-muted-foreground">{String(editing["company"] ?? "")}</p></div> : null}
          {def.fields.map((f) => (
            <label key={f.name} className={f.kind === "textarea" || f.kind === "file" ? "text-sm sm:col-span-2" : "text-sm"}>
              <span className="font-medium">{f.label}</span>
              {f.kind === "textarea" ? <textarea rows={4} className={field} value={String(editing[f.name] ?? "")} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} />
              : f.kind === "boolean" ? <div className="mt-2 flex items-center gap-2"><input type="checkbox" checked={Boolean(editing[f.name])} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.checked })} /><span className="text-xs text-muted-foreground">{editing[f.name] ? "Activé" : "Désactivé"}</span></div>
              : f.kind === "select" ? <select className={field} value={String(editing[f.name] ?? "")} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })}><option value="">—</option>{(f.name === "category" ? categoryOptions : f.options ?? []).map((o) => {
  const optionLabel =
    f.name === "placement"
      ? o === "hero_intro"
        ? "Hero — introduction / identité"
        : o === "home_showcase"
          ? "Accueil — carousel projets"
          : o
      : o;
  return <option key={o} value={o}>{optionLabel}</option>;
})}</select>
              : f.kind === "file" ? (
                <div className="mt-2 rounded-md border border-dashed border-border p-4">
                  <input type="file" accept={f.accept ?? (def.table === "media_items" && editing["kind"] === "video" ? "video/*" : "image/*,video/*")} className="block w-full text-sm" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return; setUploading(f.name);
                    try { const folder = def.table === "news" ? "news" : def.table === "projects" ? "projects" : def.table === "partners" ? "partners" : def.table === "intro_videos" ? "intro-videos" : "media"; const url = await uploadSiteFile(file, folder); setEditing((current) => current ? { ...current, [f.name]: url } : current); toast.success("Fichier téléversé."); }
                    catch (error) { toast.error(error instanceof Error ? error.message : "Téléversement impossible."); }
                    finally { setUploading(null); e.currentTarget.value = ""; }
                  }} />
                  {uploading === f.name ? <p className="mt-2 text-xs text-muted-foreground">Téléversement…</p> : null}
                  {editing[f.name] ? <div className="mt-3 flex items-center gap-3 rounded-md bg-muted p-2"><span className="min-w-0 flex-1 truncate text-xs">{String(editing[f.name])}</span><button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-background" onClick={() => setEditing({ ...editing, [f.name]: null })} aria-label={"Supprimer le fichier " + f.label}><X className="h-4 w-4" /></button></div> : <p className="mt-2 text-xs text-muted-foreground">Aucun fichier sélectionné.</p>}
                </div>
              ) : <input type={f.kind === "number" ? "number" : "text"} className={field} value={String(editing[f.name] ?? "")} onChange={(e) => { const value = f.kind === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value; const next = { ...editing, [f.name]: value }; if ((def.table === "news" || def.table === "projects") && f.name === "title" && !editing["id"]) next.slug = slugify(String(value ?? "")); setEditing(next); }} disabled={def.table === "news" && f.name === "author"} />}
            </label>
          ))}
          <div className="flex gap-2 sm:col-span-2"><Button type="submit" variant="gold" disabled={save.isPending || uploading !== null}>{save.isPending ? "Enregistrement…" : "Enregistrer"}</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Annuler</Button></div>
        </form>
      ) : null}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{def.columns.map((c) => <th key={c} className="px-4 py-3 text-xs uppercase tracking-[0.12em]">{c}</th>)}<th className="px-4 py-3" /></tr></thead><tbody>
        {visibleRows.map((row) => <tr key={String(row["id"])} className="border-t border-slate-100 hover:bg-slate-50/70">{def.columns.map((c) => <td key={c} className="px-4 py-3">{typeof row[c] === "boolean" ? (row[c] ? "Oui" : "Non") : String(row[c] ?? "—")}</td>)}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(row)}>{def.table === "testimonials" ? "Modérer" : "Modifier"}</Button>{def.table !== "testimonials" ? <Button size="sm" variant="outline" onClick={() => { if (confirm("Supprimer cet élément ?")) remove.mutate(String(row["id"])); }}>Supprimer</Button> : null}</div></td></tr>)}
        {visibleRows.length === 0 ? <tr><td className="px-4 py-6 text-muted-foreground" colSpan={def.columns.length + 1}>Aucun élément.</td></tr> : null}
      </tbody></table></div>
    </div>
  );
}
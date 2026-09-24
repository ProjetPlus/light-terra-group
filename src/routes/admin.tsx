import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { X } from "lucide-react";

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
  table: "news" | "projects" | "testimonials" | "partners" | "media_items";
  order: { column: string; ascending: boolean };
  columns: string[];
  fields: FieldDef[];
  create: boolean;
};

const TABLES: TableDef[] = [
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
  const first = rows.length ? Math.min(...rows.map((r) => Number(r.position ?? 0))) - 1 : 0;
  if (def.table === "news") Object.assign(row, { author: "LT Group", published_at: todayIsoDate(), is_published: false });
  if (def.table === "projects") Object.assign(row, { position: first, status: "en_cours", is_published: false, is_featured: false });
  if (def.table === "partners") Object.assign(row, { position: first, is_active: true });
  if (def.table === "media_items") Object.assign(row, { kind: "photo", position: first, is_active: true });
  return row;
}

function AdminPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState("messages");

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        void navigate({ to: "/me" });
        return;
      }
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) {
        toast.error("Accès réservé aux administrateurs.");
        await supabase.auth.signOut();
        void navigate({ to: "/me" });
        return;
      }
      setEmail(data.user.email ?? null);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="LIGHT TERRA GROUP" className="h-10 w-auto" />
            <span className="font-display text-lg">Tableau de bord</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{email}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                void navigate({ to: "/me" });
              }}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "messages"} onClick={() => setTab("messages")}>
            Demandes
          </TabButton>
          {TABLES.map((t) => (
            <TabButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label}
            </TabButton>
          ))}
        </div>

        <div className="mt-8">
          {tab === "messages" ? (
            <MessagesPanel />
          ) : (
            <CrudPanel def={TABLES.find((t) => t.key === tab)!} />
          )}
        </div>
      </div>
    </div>
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
  const categoryOptions = (activities ?? []).map((a) => a.title);

  const save = useMutation({
    mutationFn: async (row: Row) => {
      const id = row["id"] as string | undefined;
      const payload: Row = {};
      for (const f of def.fields) payload[f.name] = row[f.name] ?? null;
      for (const f of def.fields) if (f.required && (payload[f.name] === null || payload[f.name] === undefined || payload[f.name] === "")) throw new Error("Le champ « " + f.label + " » est obligatoire.");
      if ((def.table === "news" || def.table === "projects") && !payload.slug) payload.slug = slugify(String(payload.title ?? ""));
      if (def.table === "news") { payload.author = "LT Group"; if (!payload.published_at) payload.published_at = todayIsoDate(); }
      if (!id && (def.table === "projects" || def.table === "partners" || def.table === "media_items")) {
        const { data: firstRow } = await supabase.from(def.table).select("position").order("position", { ascending: true }).limit(1).maybeSingle();
        payload.position = firstRow?.position == null ? 0 : Number(firstRow.position) - 1;
      }
      const result = id ? await supabase.from(def.table).update(payload).eq("id", id) : await supabase.from(def.table).insert(payload);
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
        <form className="mt-6 grid gap-4 rounded-lg border border-border bg-card p-5 shadow-sm sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
          {def.table === "testimonials" ? <div className="sm:col-span-2 rounded-md bg-muted p-4 text-sm"><p className="font-medium">{String(editing.author_name ?? "")}</p><p className="mt-1 text-muted-foreground">{String(editing.message ?? "")}</p><p className="mt-2 text-xs text-muted-foreground">{String(editing.company ?? "")}</p></div> : null}
          {def.fields.map((f) => (
            <label key={f.name} className={f.kind === "textarea" || f.kind === "file" ? "text-sm sm:col-span-2" : "text-sm"}>
              <span className="font-medium">{f.label}</span>
              {f.kind === "textarea" ? <textarea rows={4} className={field} value={String(editing[f.name] ?? "")} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} />
              : f.kind === "boolean" ? <div className="mt-2 flex items-center gap-2"><input type="checkbox" checked={Boolean(editing[f.name])} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.checked })} /><span className="text-xs text-muted-foreground">{editing[f.name] ? "Activé" : "Désactivé"}</span></div>
              : f.kind === "select" ? <select className={field} value={String(editing[f.name] ?? "")} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })}><option value="">—</option>{(f.name === "category" ? categoryOptions : f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}</select>
              : f.kind === "file" ? (
                <div className="mt-2 rounded-md border border-dashed border-border p-4">
                  <input type="file" accept={f.accept ?? (def.table === "media_items" && editing.kind === "video" ? "video/*" : "image/*,video/*")} className="block w-full text-sm" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return; setUploading(f.name);
                    try { const folder = def.table === "news" ? "news" : def.table === "projects" ? "projects" : def.table === "partners" ? "partners" : "media"; const url = await uploadSiteFile(file, folder); setEditing((current) => current ? { ...current, [f.name]: url } : current); toast.success("Fichier téléversé."); }
                    catch (error) { toast.error(error instanceof Error ? error.message : "Téléversement impossible."); }
                    finally { setUploading(null); e.currentTarget.value = ""; }
                  }} />
                  {uploading === f.name ? <p className="mt-2 text-xs text-muted-foreground">Téléversement…</p> : null}
                  {editing[f.name] ? <div className="mt-3 flex items-center gap-3 rounded-md bg-muted p-2"><span className="min-w-0 flex-1 truncate text-xs">{String(editing[f.name])}</span><button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-background" onClick={() => setEditing({ ...editing, [f.name]: null })} aria-label={"Supprimer le fichier " + f.label}><X className="h-4 w-4" /></button></div> : <p className="mt-2 text-xs text-muted-foreground">Aucun fichier sélectionné.</p>}
                </div>
              ) : <input type={f.kind === "number" ? "number" : "text"} className={field} value={String(editing[f.name] ?? "")} onChange={(e) => { const value = f.kind === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value; const next = { ...editing, [f.name]: value }; if ((def.table === "news" || def.table === "projects") && f.name === "title" && !editing.id) next.slug = slugify(String(value ?? "")); setEditing(next); }} disabled={def.table === "news" && f.name === "author"} />}
            </label>
          ))}
          <div className="flex gap-2 sm:col-span-2"><Button type="submit" variant="gold" disabled={save.isPending || uploading !== null}>{save.isPending ? "Enregistrement…" : "Enregistrer"}</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Annuler</Button></div>
        </form>
      ) : null}
      <div className="mt-6 overflow-x-auto rounded-lg border border-border"><table className="w-full text-left text-sm"><thead className="bg-muted/60"><tr>{def.columns.map((c) => <th key={c} className="px-4 py-3 text-xs uppercase tracking-[0.12em]">{c}</th>)}<th className="px-4 py-3" /></tr></thead><tbody>
        {rows.map((row) => <tr key={String(row["id"])} className="border-t border-border">{def.columns.map((c) => <td key={c} className="px-4 py-3">{typeof row[c] === "boolean" ? (row[c] ? "Oui" : "Non") : String(row[c] ?? "—")}</td>)}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(row)}>{def.table === "testimonials" ? "Modérer" : "Modifier"}</Button>{def.table !== "testimonials" ? <Button size="sm" variant="outline" onClick={() => { if (confirm("Supprimer cet élément ?")) remove.mutate(String(row["id"])); }}>Supprimer</Button> : null}</div></td></tr>)}
        {rows.length === 0 ? <tr><td className="px-4 py-6 text-muted-foreground" colSpan={def.columns.length + 1}>Aucun élément.</td></tr> : null}
      </tbody></table></div>
    </div>
  );
}
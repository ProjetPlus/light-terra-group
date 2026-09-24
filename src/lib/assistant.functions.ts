import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().trim().min(1).max(1200),
    }),
  ).min(1).max(12),
});

type KnowledgeRow = { question: string; answer: string; is_active: boolean; position: number };
type SiteContext = {
  company: Record<string, unknown> | null;
  activities: Array<{ title: string; short_description: string | null }>;
  knowledge: KnowledgeRow[];
  projects: Array<{ title: string; summary: string | null; location: string | null }>;
  news: Array<{ title: string; excerpt: string | null; published_at: string | null }>;
};

function localReply(question: string, ctx: SiteContext) {
    const normalize = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const nq = normalize(question);
  const scored = ctx.knowledge
    .filter((item) => item.is_active)
    .map((item) => {
      const hay = normalize(item.question + " " + item.answer);
      const words = nq.split(/\s+/).filter((w) => w.length > 3);
      const score = words.reduce((n, word) => n + (hay.includes(word) ? 1 : 0), 0);
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (best && best.score > 0) return best.item.answer;

  if (/activit|service|fait|metier|domaine|secteur/.test(nq) && ctx.activities.length) {
    return "LIGHT TERRA GROUP intervient notamment dans " +
      ctx.activities.slice(0, 5).map((a) => a.title).join(", ") +
      ". Vous pouvez consulter la page « Nos activités » pour le détail.";
  }

  if (/projet|realisation|chantier/.test(nq) && ctx.projects.length) {
    return "Les projets publiés sur le site comprennent notamment : " +
      ctx.projects.slice(0, 4).map((p) => p.title + (p.location ? " (" + p.location + ")" : "")).join(", ") +
      ". Consultez la page « Projets » pour voir les détails.";
  }

  if (/actualite|nouvelle|news/.test(nq) && ctx.news.length) {
    return "Les dernières actualités publiées sont : " +
      ctx.news.slice(0, 3).map((n) => n.title).join(", ") +
      ". Vous pouvez consulter la page « Actualités ».";
  }

  const company = ctx.company ?? {};
  if (/contact|telephone|whatsapp|email|mail|joindre|adresse/.test(nq)) {
    const parts = [
      company["phone_primary"] ? "Téléphone : " + company["phone_primary"] : "",
      company["whatsapp"] ? "WhatsApp : " + company["whatsapp"] : "",
      company["email"] ? "E-mail : " + company["email"] : "",
      company["address"] ? "Adresse : " + [company["address"], company["city"], company["country"]].filter(Boolean).join(", ") : "",
    ].filter(Boolean);
    if (parts.length) return parts.join(" — ");
  }

  return "Je peux vous renseigner sur les activités, projets, actualités et coordonnées de LIGHT TERRA GROUP. Pour une demande précise ou un devis, utilisez la page « Services & devis » ou « Contact ».";
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const supabaseUrl = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
    const supabaseKey =
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];

    const empty: SiteContext = { company: null, activities: [], knowledge: [], projects: [], news: [] };
    let ctx = empty;

    if (supabaseUrl && supabaseKey) {
      const client = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const [kb, info, activities, projects, news] = await Promise.all([
        client.from("ai_knowledge").select("question,answer,is_active,position").eq("is_active", true).order("position"),
        client.from("company_info").select("*").limit(1).maybeSingle(),
        client.from("activities").select("title,short_description").eq("is_active", true).order("position"),
        client.from("projects").select("title,summary,location").eq("is_published", true).order("position").limit(8),
        client.from("news").select("title,excerpt,published_at").eq("is_published", true).order("published_at", { ascending: false }).limit(8),
      ]);
      ctx = {
        company: info.data as Record<string, unknown> | null,
        activities: (activities.data ?? []) as SiteContext["activities"],
        knowledge: (kb.data ?? []) as KnowledgeRow[],
        projects: (projects.data ?? []) as SiteContext["projects"],
        news: (news.data ?? []) as SiteContext["news"],
      };
    }

    const latestUserMessage = [...data.messages].reverse().find((m) => m.role === "user")?.content ?? "";

    const system = `Tu es Raï, l'assistante virtuelle officielle de LIGHT TERRA GROUP. Réponds en français, avec un ton professionnel et chaleureux, en 3 phrases maximum. Utilise uniquement le contexte fourni et n'invente jamais d'information. Si une information n'est pas disponible, oriente vers les pages Contact ou Services & devis.

CONTEXTE ENTREPRISE:
${JSON.stringify(ctx.company ?? {})}

ACTIVITÉS:
${ctx.activities.map((a) => "- " + a.title + ": " + (a.short_description ?? "")).join("\\n")}

BASE DE CONNAISSANCES:
${ctx.knowledge.map((k) => "Q: " + k.question + "\\nR: " + k.answer).join("\\n\\n")}

PROJETS:
${ctx.projects.map((p) => "- " + p.title + (p.location ? " — " + p.location : "") + (p.summary ? ": " + p.summary : "")).join("\\n")}

ACTUALITÉS:
${ctx.news.map((n) => "- " + n.title + (n.excerpt ? ": " + n.excerpt : "")).join("\\n")}`;

    const openAiKey = process.env["OPENAI_API_KEY"];
    const lovableKey = process.env["LOVABLE_API_KEY"];

    try {
      if (openAiKey) {
        const response = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiKey}` },
          body: JSON.stringify({
            model: process.env["OPENAI_MODEL"] ?? "gpt-5.6-luna",
            instructions: system,
            input: data.messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        if (response.ok) {
          const payload = (await response.json()) as { output_text?: string };
          const reply = payload.output_text?.trim();
          if (reply) return { ok: true as const, reply };
        } else {
          console.error("OpenAI assistant error", response.status, await response.text());
        }
      } else if (lovableKey) {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
          body: JSON.stringify({
            model: "openai/gpt-5.6-terra",
            input: [{ role: "system", content: system }, ...data.messages],
          }),
        });
        if (response.ok) {
          const payload = (await response.json()) as {
            output_text?: string;
            output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
          };
          const reply =
            payload.output_text ??
            payload.output?.flatMap((item) => item.content ?? []).map((c) => c.text ?? "").join("");
          if (reply?.trim()) return { ok: true as const, reply: reply.trim() };
        } else {
          console.error("Lovable assistant error", response.status, await response.text());
        }
      }
    } catch (error) {
      console.error("Assistant provider error", error);
    }

    // Fallback autonome : Raï reste fonctionnelle même sans fournisseur IA externe.
    return { ok: true as const, reply: localReply(latestUserMessage, ctx) };
  });

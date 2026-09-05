import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const supabaseUrl = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
    const supabaseKey =
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];

    let knowledge = "";
    let company = "";

    if (supabaseUrl && supabaseKey) {
      const client = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const [kb, info, activities] = await Promise.all([
        client.from("ai_knowledge").select("question,answer").eq("is_active", true),
        client.from("company_info").select("*").limit(1).maybeSingle(),
        client.from("activities").select("title,short_description").eq("is_active", true),
      ]);
      knowledge = (kb.data ?? []).map((k) => `Q: ${k.question}\nR: ${k.answer}`).join("\n\n");
      const acts = (activities.data ?? [])
        .map((a) => `- ${a.title} : ${a.short_description}`)
        .join("\n");
      company = [
        info.data ? `Nom: ${info.data.name}` : "",
        info.data?.slogan ? `Slogan: ${info.data.slogan}` : "",
        info.data?.description ? `Présentation: ${info.data.description}` : "",
        info.data?.phone_primary ? `Téléphone: ${info.data.phone_primary}` : "",
        info.data?.whatsapp ? `WhatsApp: ${info.data.whatsapp}` : "",
        info.data?.email ? `E-mail: ${info.data.email}` : "",
        [info.data?.address, info.data?.city, info.data?.country].filter(Boolean).length
          ? `Adresse: ${[info.data?.address, info.data?.city, info.data?.country].filter(Boolean).join(", ")}`
          : "",
        acts ? `Pôles d'activité:\n${acts}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    }

    const system = `Tu es l'assistant officiel du site de LIGHT TERRA GROUP. Tu réponds en français, brièvement (3 phrases maximum), avec un ton professionnel et chaleureux.

Règles strictes :
- Utilise UNIQUEMENT les informations ci-dessous. N'invente jamais de projet, prix, adresse, délai, engagement ou coordonnée.
- Si l'information n'est pas disponible, dis-le et invite la personne à utiliser la page Contact ou le formulaire de demande de devis.
- Oriente vers les pages du site quand c'est utile : /a-propos, /activites, /projets, /services, /actualites, /temoignages, /contact.

INFORMATIONS ENTREPRISE
${company || "Non renseignées pour le moment."}

BASE DE CONNAISSANCES
${knowledge || "Vide."}`;

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, status: 401, message: "Assistant indisponible pour le moment." };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-terra",
        input: [
          { role: "system", content: system },
          ...data.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("AI gateway error", response.status, detail);
      const message =
        response.status === 429
          ? "Trop de demandes en ce moment, merci de réessayer dans un instant."
          : response.status === 402
            ? "L'assistant est momentanément indisponible. Utilisez la page Contact."
            : "L'assistant n'a pas pu répondre. Utilisez la page Contact.";
      return { ok: false as const, status: response.status, message };
    }

    const payload = (await response.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    const text =
      payload.output_text ??
      payload.output
        ?.flatMap((item) => item.content ?? [])
        .filter((c) => c.type === "output_text" || typeof c.text === "string")
        .map((c) => c.text ?? "")
        .join("") ??
      "";

    return { ok: true as const, reply: text.trim() || "Je n'ai pas de réponse pour cette question." };
  });

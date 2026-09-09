import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const replySchema = z.object({
  messageId: z.string().uuid(),
  reply: z.string().trim().min(2).max(5000),
});

/** Répond à une demande : enregistre la réponse puis envoie l'e-mail au demandeur. */
export const replyToMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => replySchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roles) throw new Error("Forbidden");

    const { data: msg, error: readError } = await supabase
      .from("messages")
      .select("id, full_name, email, subject, message")
      .eq("id", data.messageId)
      .maybeSingle();
    if (readError || !msg) throw new Error("Demande introuvable");

    const { error } = await supabase
      .from("messages")
      .update({
        admin_reply: data.reply,
        replied_at: new Date().toISOString(),
        status: "traite",
      })
      .eq("id", data.messageId);
    if (error) throw new Error(error.message);

    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
      return {
        ok: true as const,
        emailed: false as const,
        message: "Réponse enregistrée (e-mail non envoyé : clé e-mail manquante).",
      };
    }

    const from = process.env["RESEND_FROM"] ?? "LIGHT TERRA GROUP <onboarding@resend.dev>";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from,
          to: [msg.email],
          reply_to: "contact@lightterragroup.com",
          subject: `Réponse à votre demande — ${msg.subject ?? "LIGHT TERRA GROUP"}`,
          text: `Bonjour ${msg.full_name},\n\n${data.reply}\n\n--\nLIGHT TERRA GROUP\nBÂTIR LA TERRE, ÉCLAIRER L'AVENIR\ncontact@lightterragroup.com`,
        }),
      });
      if (!res.ok) {
        console.error("resend reply error", res.status, await res.text());
        return {
          ok: true as const,
          emailed: false as const,
          message: "Réponse enregistrée, mais l'e-mail n'a pas pu être envoyé.",
        };
      }
    } catch (e) {
      console.error("resend reply exception", e);
      return {
        ok: true as const,
        emailed: false as const,
        message: "Réponse enregistrée, mais l'e-mail n'a pas pu être envoyé.",
      };
    }

    return { ok: true as const, emailed: true as const, message: "Réponse envoyée par e-mail." };
  });

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const schema = z.object({
  request_type: z.enum(["contact", "devis"]),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  project_type: z.string().trim().max(120).optional().or(z.literal("")),
  budget_range: z.string().trim().max(120).optional().or(z.literal("")),
  desired_date: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(5000),
});

const NOTIFY_TO = "contact@lightterragroup.com";

export const submitRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const key =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) {
      return { ok: false as const, message: "Service indisponible. Merci de réessayer." };
    }

    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const row = {
      request_type: data.request_type,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      subject: data.subject || null,
      project_type: data.project_type || null,
      budget_range: data.budget_range || null,
      desired_date: data.desired_date ? data.desired_date : null,
      message: data.message,
      status: "nouveau",
    };

    const { error } = await client.from("messages").insert(row);
    if (error) {
      console.error("insert message error", error.message);
      return { ok: false as const, message: "L'envoi a échoué. Merci de réessayer." };
    }

    const apiKey = process.env["RESEND_API_KEY"];
    if (apiKey) {
      const from = process.env["RESEND_FROM"] ?? "LIGHT TERRA GROUP <onboarding@resend.dev>";
      const subject =
        data.request_type === "devis"
          ? `Nouvelle demande de devis — ${data.full_name}`
          : `Nouveau message — ${data.full_name}`;
      const lines = [
        `Nom : ${data.full_name}`,
        `E-mail : ${data.email}`,
        data.phone ? `Téléphone : ${data.phone}` : "",
        data.company ? `Structure : ${data.company}` : "",
        data.project_type ? `Type de projet : ${data.project_type}` : "",
        data.budget_range ? `Budget : ${data.budget_range}` : "",
        data.desired_date ? `Date souhaitée : ${data.desired_date}` : "",
        "",
        data.message,
      ].filter(Boolean);
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from,
            to: [NOTIFY_TO],
            reply_to: data.email,
            subject,
            text: lines.join("\n"),
          }),
        });
        if (!res.ok) console.error("resend error", res.status, await res.text());
      } catch (e) {
        console.error("resend exception", e);
      }
    }

    return { ok: true as const, message: "Votre demande a bien été envoyée. Merci !" };
  });

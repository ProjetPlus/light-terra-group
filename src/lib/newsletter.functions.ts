import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const signupSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(6).max(40),
});

const notifySchema = z.object({
  accessToken: z.string().min(20),
  newsId: z.string().uuid(),
});

function env(name: string) {
  return process.env[name] ?? "";
}

function supabaseAdmin() {
  const url = env("SUPABASE_URL") || env("VITE_SUPABASE_URL") || "https://ghkijyimotuivykvwlge.supabase.co";
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Configuration serveur Supabase manquante.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]!));
}

function logoUrl() {
  return env("LT_GROUP_LOGO_URL") || "https://ltgroup-ci.com/media/logo-light-terra-transparent.png";
}

function fromAddress() {
  const value = env("RESEND_FROM_EMAIL");
  if (!value) throw new Error("RESEND_FROM_EMAIL n'est pas configuré.");
  return value;
}

async function sendResend(to: string, subject: string, html: string) {
  const key = env("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY n'est pas configurée.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ from: fromAddress(), to: [to], subject, html }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
}

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => signupSchema.parse(data))
  .handler(async ({ data }) => {
    const db = supabaseAdmin();
    const email = data.email.toLowerCase();
    const { data: existing } = await db.from("newsletter_subscribers").select("*").eq("email", email).maybeSingle();

    if (existing?.status === "active") {
      return { ok: true as const, alreadySubscribed: true, message: "Cette adresse est déjà abonnée à la newsletter." };
    }

    const { data: subscriber, error } = await db.from("newsletter_subscribers").upsert({
      full_name: data.fullName,
      email,
      phone: data.phone,
      status: "active",
      source: "website",
    }, { onConflict: "email" }).select("*").single();

    if (error || !subscriber) throw new Error(error?.message ?? "Inscription impossible.");

    let welcomeSent = Boolean(existing?.welcome_sent_at);
    if (welcomeSent) {
      return { ok: true as const, alreadySubscribed: true, welcomeSent: true, message: "Cette adresse est déjà abonnée à la newsletter." };
    }
    try {
      const name = escapeHtml(data.fullName);
      await sendResend(
        email,
        "Bienvenue dans la newsletter LT GROUP",
        `<div style="margin:0;background:#f5f7f5;padding:32px;font-family:Arial,sans-serif;color:#17211d"><div style="max-width:640px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e4e9e6"><div style="padding:26px 30px;background:#0b1f18;text-align:center"><img src="${logoUrl()}" alt="LT GROUP" style="max-width:210px;max-height:70px;object-fit:contain"></div><div style="padding:34px"><p style="color:#a47a28;text-transform:uppercase;letter-spacing:2px;font-size:11px;font-weight:700">Bienvenue</p><h1 style="font-size:28px;margin:10px 0 16px">Bonjour ${name},</h1><p style="font-size:16px;line-height:1.7;color:#59635e">Votre inscription à la newsletter LT GROUP est confirmée.</p><p style="font-size:16px;line-height:1.7;color:#59635e">Vous recevrez nos principales actualités, opportunités et informations sur nos projets directement par e-mail.</p><div style="margin-top:28px;padding:18px;background:#f5f7f5;border-radius:12px"><strong>LT GROUP</strong><br><span style="color:#59635e">Bâtir la terre, éclairer l'avenir</span></div></div></div></div>`,
      );
      welcomeSent = true;
      await db.from("newsletter_subscribers").update({ welcome_sent_at: new Date().toISOString() }).eq("id", subscriber.id);
    } catch (error) {
      console.error("Newsletter welcome email error", error);
    }

    return { ok: true as const, alreadySubscribed: false, welcomeSent, message: welcomeSent ? "Inscription confirmée. Un e-mail de bienvenue vient de vous être envoyé." : "Inscription confirmée. Votre e-mail de bienvenue sera envoyé dès que la messagerie sera disponible." };
  });

export const notifyNewsSubscribers = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => notifySchema.parse(data))
  .handler(async ({ data }) => {
    const db = supabaseAdmin();
    const { data: user, error: userError } = await db.auth.getUser(data.accessToken);
    if (userError || !user.user) throw new Error("Session administrateur invalide.");

    const { data: role } = await db.from("user_roles").select("role").eq("user_id", user.user.id).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Accès administrateur requis.");

    const { data: news, error: newsError } = await db.from("news").select("id,title,slug,excerpt,content,cover_image_url,image_url,published_at,is_published").eq("id", data.newsId).maybeSingle();
    if (newsError || !news || !news.is_published) return { ok: true as const, sent: 0, skipped: true };

    const { data: subscribers } = await db.from("newsletter_subscribers").select("id,email,full_name").eq("status", "active");
    let sent = 0;

    for (const subscriber of subscribers ?? []) {
      const { data: existingDelivery, error: existingDeliveryError } = await db
        .from("newsletter_deliveries")
        .select("id,status")
        .eq("subscriber_id", subscriber.id)
        .eq("news_id", news.id)
        .maybeSingle();

      if (existingDeliveryError) continue;
      if (existingDelivery?.status === "sent") continue;

      const deliveryId = existingDelivery?.id ?? null;
      if (deliveryId) {
        const { error: resetError } = await db
          .from("newsletter_deliveries")
          .update({ status: "pending", error_message: null, sent_at: null })
          .eq("id", deliveryId);
        if (resetError) continue;
      } else {
        const { data: createdDelivery, error: createDeliveryError } = await db
          .from("newsletter_deliveries")
          .insert({ subscriber_id: subscriber.id, news_id: news.id, status: "pending" })
          .select("id")
          .single();
        if (createDeliveryError || !createdDelivery) continue;
      }

      try {
        const siteUrl = env("SITE_URL") || "https://ltgroup-ci.com";
        const link = `${siteUrl}/actualites/${encodeURIComponent(news.slug)}`;
        const name = escapeHtml(subscriber.full_name);
        const title = escapeHtml(news.title);
        const excerpt = escapeHtml(news.excerpt || news.content?.slice(0, 260) || "");
        await sendResend(
          subscriber.email,
          `LT GROUP — ${news.title}`,
          `<div style="margin:0;background:#f5f7f5;padding:32px;font-family:Arial,sans-serif;color:#17211d"><div style="max-width:680px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e4e9e6"><div style="padding:24px 30px;background:#0b1f18;text-align:center"><img src="${logoUrl()}" alt="LT GROUP" style="max-width:210px;max-height:70px;object-fit:contain"></div>${news.cover_image_url || news.image_url ? `<img src="${escapeHtml(news.cover_image_url || news.image_url || "")}" alt="" style="display:block;width:100%;height:280px;object-fit:cover">` : ""}<div style="padding:34px"><p style="color:#a47a28;text-transform:uppercase;letter-spacing:2px;font-size:11px;font-weight:700">Actualité LT GROUP</p><h1 style="font-size:27px;line-height:1.25;margin:10px 0 16px">${title}</h1><p style="font-size:16px;line-height:1.7;color:#59635e">Bonjour ${name},</p><p style="font-size:16px;line-height:1.7;color:#59635e">${excerpt}</p><a href="${link}" style="display:inline-block;margin-top:18px;background:#b58a3a;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">Lire l'actualité</a></div></div></div>`,
        );
        await db.from("newsletter_deliveries").update({ status: "sent", sent_at: new Date().toISOString(), error_message: null }).eq("subscriber_id", subscriber.id).eq("news_id", news.id);
        sent++;
      } catch (error) {
        await db.from("newsletter_deliveries").update({ status: "failed", error_message: error instanceof Error ? error.message.slice(0, 500) : "Erreur d'envoi" }).eq("id", delivery.id);
      }
    }

    return { ok: true as const, sent };
  });

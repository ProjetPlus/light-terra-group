import { createFileRoute } from "@tanstack/react-router";

/**
 * Création idempotente du compte super administrateur.
 * Protégée par un secret : POST avec l'en-tête x-bootstrap-secret.
 */
export const Route = createFileRoute("/api/public/bootstrap-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["LOVABLE_CRON_SECRET"];
        if (!secret || request.headers.get("x-bootstrap-secret") !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await request.json().catch(() => ({}))) as {
          email?: string;
          password?: string;
        };
        const email = body.email;
        const password = body.password;
        if (!email || !password) return new Response("Bad request", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let userId: string | null = null;
        const created = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (created.data.user) {
          userId = created.data.user.id;
        } else {
          const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
          const found = list.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
          if (!found) {
            return new Response(created.error?.message ?? "User not found", { status: 500 });
          }
          userId = found.id;
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
          });
        }

        const { error } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
        if (error) return new Response(error.message, { status: 500 });

        return Response.json({ ok: true, userId });
      },
    },
  },
});

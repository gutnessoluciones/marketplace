import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const banSchema = z.object({
  action: z.enum(["ban", "unban"]),
  reason: z.string().min(1).max(500).optional(),
});

const verifySchema = z.object({
  action: z.enum(["verify", "unverify"]),
  status: z
    .enum(["none", "pending", "verified", "top_seller", "creator"])
    .optional(),
});

// PATCH /api/admin/users/[id] — Ban/unban or verify user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { id } = await params;
    const body = await request.json();

    // Try ban/unban first
    const banResult = banSchema.safeParse(body);
    if (banResult.success) {
      const { action, reason } = banResult.data;

      if (action === "ban") {
        if (!reason) {
          return apiResponse(
            { error: "Se requiere un motivo para banear" },
            400,
          );
        }

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            is_banned: true,
            ban_reason: reason,
            banned_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) return apiResponse({ error: error.message }, 500);

        // Log action
        await supabaseAdmin.from("admin_actions").insert({
          admin_id: auth.userId,
          action: "ban_user",
          target_type: "user",
          target_id: id,
          reason,
        });

        return apiResponse({ success: true, action: "banned" });
      } else {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            is_banned: false,
            ban_reason: null,
            banned_at: null,
          })
          .eq("id", id);

        if (error) return apiResponse({ error: error.message }, 500);

        await supabaseAdmin.from("admin_actions").insert({
          admin_id: auth.userId,
          action: "unban_user",
          target_type: "user",
          target_id: id,
        });

        return apiResponse({ success: true, action: "unbanned" });
      }
    }

    // Try verify/unverify
    const verifyResult = verifySchema.safeParse(body);
    if (verifyResult.success) {
      const { action, status } = verifyResult.data;
      const newStatus = action === "verify" ? status || "verified" : "none";

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ verification_status: newStatus })
        .eq("id", id);

      if (error) return apiResponse({ error: error.message }, 500);

      await supabaseAdmin.from("admin_actions").insert({
        admin_id: auth.userId,
        action: action === "verify" ? "verify_user" : "unverify_user",
        target_type: "user",
        target_id: id,
        metadata: { status: newStatus },
      });

      return apiResponse({ success: true, action, status: newStatus });
    }

    return apiResponse({ error: "Acción no válida" }, 400);
  } catch (error) {
    return apiError(error);
  }
}

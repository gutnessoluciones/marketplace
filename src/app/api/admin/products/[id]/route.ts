import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const moderateSchema = z.object({
  action: z.enum(["hide", "activate", "remove"]),
  reason: z.string().min(1).max(500).optional(),
});

// PATCH /api/admin/products/[id] — Moderate product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { id } = await params;
    const body = await request.json();
    const parsed = moderateSchema.safeParse(body);
    if (!parsed.success) return apiResponse({ error: "Datos no válidos" }, 400);

    const { action, reason } = parsed.data;

    if (action === "remove") {
      const { error } = await supabaseAdmin
        .from("products")
        .delete()
        .eq("id", id);

      if (error) return apiResponse({ error: error.message }, 500);

      await supabaseAdmin.from("admin_actions").insert({
        admin_id: auth.userId,
        action: "remove_product",
        target_type: "product",
        target_id: id,
        reason: reason || "Eliminado por admin",
      });

      return apiResponse({ success: true, action: "removed" });
    }

    const newStatus = action === "hide" ? "archived" : "active";
    const { error } = await supabaseAdmin
      .from("products")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) return apiResponse({ error: error.message }, 500);

    await supabaseAdmin.from("admin_actions").insert({
      admin_id: auth.userId,
      action: action === "hide" ? "hide_product" : "activate_product",
      target_type: "product",
      target_id: id,
      reason,
    });

    return apiResponse({ success: true, action, status: newStatus });
  } catch (error) {
    return apiError(error);
  }
}

import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const resolveSchema = z.object({
  status: z.enum(["resolved", "dismissed"]),
  resolution_notes: z.string().max(1000).optional(),
});

// PATCH /api/admin/reports/[id] — Resolve a report
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { id } = await params;
    const body = await request.json();
    const parsed = resolveSchema.safeParse(body);
    if (!parsed.success) return apiResponse({ error: "Datos no válidos" }, 400);

    const { status, resolution_notes } = parsed.data;

    const { error } = await supabaseAdmin
      .from("content_reports")
      .update({
        status,
        resolution_notes: resolution_notes || null,
        resolved_by: auth.userId,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return apiResponse({ error: error.message }, 500);

    await supabaseAdmin.from("admin_actions").insert({
      admin_id: auth.userId,
      action: status === "resolved" ? "resolve_report" : "dismiss_report",
      target_type: "report",
      target_id: id,
      reason: resolution_notes,
    });

    return apiResponse({ success: true, status });
  } catch (error) {
    return apiError(error);
  }
}

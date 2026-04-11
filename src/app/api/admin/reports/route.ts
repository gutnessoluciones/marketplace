import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";

// GET /api/admin/reports — List content reports
export async function GET(request: NextRequest) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";

    let query = supabaseAdmin
      .from("content_reports")
      .select(
        "*, reporter:profiles!reporter_id(id, display_name, avatar_url), reported_user:profiles!reported_user_id(id, display_name, avatar_url)",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) return apiResponse({ error: error.message }, 500);

    return apiResponse({ data });
  } catch (error) {
    return apiError(error);
  }
}

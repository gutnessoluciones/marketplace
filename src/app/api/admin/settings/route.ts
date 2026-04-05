import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { updateSiteSettingSchema } from "@/validations/schemas";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/admin/settings — Get all site settings
export async function GET(request: NextRequest) {
  const rl = rateLimit(request, "admin");
  if (rl) return rl;

  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .order("key");

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse(data);
  } catch (error) {
    return apiError(error);
  }
}

// PATCH /api/admin/settings — Update a site setting
export async function PATCH(request: NextRequest) {
  const rl = rateLimit(request, "admin");
  if (rl) return rl;

  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);
    if (auth.role !== "owner" && auth.role !== "dev") {
      return apiResponse(
        { error: "Solo owners y devs pueden editar configuración" },
        403,
      );
    }

    const body = await request.json();
    const parsed = updateSiteSettingSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .update({
        value: parsed.value,
        updated_at: new Date().toISOString(),
        updated_by: auth.userId,
      })
      .eq("key", parsed.key)
      .select()
      .single();

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse(data);
  } catch (error) {
    return apiError(error);
  }
}

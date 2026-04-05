import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiResponse, apiError } from "@/lib/utils";
import { updateProfileSchema } from "@/validations/schemas";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/profile — Get current user profile
export async function GET(request: NextRequest) {
  const rl = rateLimit(request, "api");
  if (rl) return rl;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse(data);
  } catch (error) {
    return apiError(error);
  }
}

// PATCH /api/profile — Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = updateProfileSchema.parse(body);

    const { data, error } = await supabase
      .from("profiles")
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single();

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse(data);
  } catch (error) {
    return apiError(error);
  }
}

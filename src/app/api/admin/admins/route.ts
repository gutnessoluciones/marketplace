import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const addAdminSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["owner", "dev", "admin"]),
});

// POST /api/admin/admins — Add an admin user
export async function POST(request: NextRequest) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized || auth.role !== "owner") {
      return apiResponse(
        { error: "Solo el owner puede gestionar admins" },
        403,
      );
    }

    const body = await request.json();
    const parsed = addAdminSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .upsert(
        { user_id: parsed.user_id, role: parsed.role },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse(data, 201);
  } catch (error) {
    return apiError(error);
  }
}

// GET /api/admin/admins — List admin users
export async function GET() {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .select("*, profile:profiles(id, display_name, avatar_url)")
      .order("created_at");

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse(data);
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/admin/admins — Remove an admin user
export async function DELETE(request: NextRequest) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized || auth.role !== "owner") {
      return apiResponse(
        { error: "Solo el owner puede gestionar admins" },
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    if (!userId) return apiResponse({ error: "user_id required" }, 400);

    // Can't remove yourself
    if (userId === auth.userId) {
      return apiResponse({ error: "No puedes eliminarte a ti mismo" }, 400);
    }

    const { error } = await supabaseAdmin
      .from("admin_users")
      .delete()
      .eq("user_id", userId);

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

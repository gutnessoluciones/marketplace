import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";

// GET /api/admin/products — List all products (admin only)
export async function GET() {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*, seller:profiles!seller_id(display_name)")
      .order("created_at", { ascending: false });

    if (error) return apiResponse({ error: error.message }, 500);

    return apiResponse({ data });
  } catch (error) {
    return apiError(error);
  }
}

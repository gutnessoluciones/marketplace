import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";

// GET /api/fairs — Public fairs list
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("fairs")
      .select(
        "id, name, city, province, start_date, end_date, description, image_url, location_url, is_major, year",
      )
      .order("start_date", { ascending: true });

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ data });
  } catch (error) {
    return apiError(error);
  }
}

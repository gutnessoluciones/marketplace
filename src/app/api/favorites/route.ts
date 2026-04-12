import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FavoritesService } from "@/services/favorites.service";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/favorites — list user's favorite product IDs
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiResponse({ ids: [] });

    const service = new FavoritesService(supabase);
    const ids = await service.getUserFavoriteIds(user.id);
    return apiResponse({ ids });
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/favorites — toggle favorite on a product
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "api");
  if (rl) return rl;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const productId = body.product_id;
    if (!productId) return apiResponse({ error: "product_id required" }, 400);

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId))
      return apiResponse({ error: "product_id inválido" }, 400);

    const service = new FavoritesService(supabase);
    const result = await service.toggle(user.id, productId);
    return apiResponse(result);
  } catch (error) {
    return apiError(error);
  }
}

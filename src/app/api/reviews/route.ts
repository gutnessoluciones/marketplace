import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ReviewsService } from "@/services/reviews.service";
import { createReviewSchema } from "@/validations/schemas";
import { apiResponse, apiError } from "@/lib/utils";

// GET /api/reviews?product_id=xxx&page=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const productId = searchParams.get("product_id");
    const page = Number(searchParams.get("page")) || 1;

    if (!productId) {
      return apiResponse({ error: "product_id is required" }, 400);
    }

    const supabase = await createClient();
    const service = new ReviewsService(supabase);
    const result = await service.listByProduct(productId, page);
    return apiResponse(result);
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse({ error: parsed.error.flatten() }, 400);
    }

    const service = new ReviewsService(supabase);
    const review = await service.create(user.id, parsed.data);
    return apiResponse(review, 201);
  } catch (error) {
    return apiError(error);
  }
}

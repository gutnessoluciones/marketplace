import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProductsService } from "@/services/products.service";
import { FollowsService } from "@/services/follows.service";
import { NotificationsService } from "@/services/notifications.service";
import { createProductSchema } from "@/validations/schemas";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/products?page=1&category=electronics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get("page")) || 1;
    const category = searchParams.get("category") || undefined;

    const supabase = await createClient();
    const service = new ProductsService(supabase);
    const result = await service.list(page, 20, category);

    return apiResponse(result);
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "api");
  if (rl) return rl;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "seller") {
      return apiResponse({ error: "Only sellers can create products" }, 403);
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse({ error: parsed.error.flatten() }, 400);
    }

    const service = new ProductsService(supabase);
    const product = await service.create(user.id, parsed.data);

    // Notify followers about new product (fire-and-forget)
    notifyFollowers(supabase, user.id, product).catch(() => {});

    return apiResponse(product, 201);
  } catch (error) {
    return apiError(error);
  }
}

async function notifyFollowers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sellerId: string,
  product: { id: string; title: string },
) {
  const followsService = new FollowsService(supabase);
  const notifications = new NotificationsService(supabase);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", sellerId)
    .single();

  const sellerName = profile?.display_name ?? "Un vendedor";

  // Get all followers (paginate in batches)
  let page = 1;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    const { data: followers, total } = await followsService.getFollowers(
      sellerId,
      page,
      limit,
    );

    const promises = followers.map((f: { follower_id: string }) =>
      notifications.create({
        user_id: f.follower_id,
        type: "new_product",
        title: "Nuevo producto",
        message: `${sellerName} ha subido "${product.title}"`,
        data: { product_id: product.id, seller_id: sellerId },
      }),
    );

    await Promise.allSettled(promises);

    hasMore = (total ?? 0) > page * limit;
    page++;
  }
}

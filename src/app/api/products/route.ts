import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProductsService } from "@/services/products.service";
import { createProductSchema } from "@/validations/schemas";
import { apiResponse, apiError } from "@/lib/utils";

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

    return apiResponse(product, 201);
  } catch (error) {
    return apiError(error);
  }
}

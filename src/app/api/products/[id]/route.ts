import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProductsService } from "@/services/products.service";
import { updateProductSchema } from "@/validations/schemas";
import { apiResponse, apiError } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const service = new ProductsService(supabase);
    const product = await service.getById(id);
    return apiResponse(product);
  } catch (error) {
    return apiError(error);
  }
}

// PUT /api/products/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse({ error: parsed.error.flatten() }, 400);
    }

    const service = new ProductsService(supabase);
    const product = await service.update(id, user.id, parsed.data);
    return apiResponse(product);
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/products/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const service = new ProductsService(supabase);
    await service.delete(id, user.id);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error);
  }
}

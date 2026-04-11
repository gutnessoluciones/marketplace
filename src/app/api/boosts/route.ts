import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BoostsService } from "@/services/boosts.service";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const createBoostSchema = z.object({
  product_id: z.string().uuid(),
  boost_type: z.enum(["featured", "top", "highlight"]),
});

// POST /api/boosts — create a boost
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = createBoostSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse({ error: "Datos inválidos" }, 400);
    }

    const service = new BoostsService(supabase);
    const boost = await service.create(
      user.id,
      parsed.data.product_id,
      parsed.data.boost_type,
    );
    return apiResponse(boost, 201);
  } catch (error) {
    return apiError(error);
  }
}

// GET /api/boosts — list seller's boosts
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const service = new BoostsService(supabase);
    const boosts = await service.listBySeller(user.id);
    return apiResponse(boosts);
  } catch (error) {
    return apiError(error);
  }
}

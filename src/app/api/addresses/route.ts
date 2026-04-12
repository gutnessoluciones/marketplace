import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AddressesService } from "@/services/addresses.service";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().max(50).optional(),
  full_name: z.string().min(2).max(100),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postal_code: z.string().min(1).max(20),
  country: z.string().length(2).default("ES"),
  phone: z.string().max(20).optional(),
  is_default: z.boolean().optional(),
});

// GET /api/addresses
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const service = new AddressesService(supabase);
    const addresses = await service.list(user.id);
    return apiResponse(addresses);
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/addresses
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
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse({ error: parsed.error.flatten() }, 400);
    }

    const service = new AddressesService(supabase);
    const address = await service.create(user.id, parsed.data);
    return apiResponse(address, 201);
  } catch (error) {
    return apiError(error);
  }
}

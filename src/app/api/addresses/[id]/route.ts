import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AddressesService } from "@/services/addresses.service";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const updateAddressSchema = z
  .object({
    label: z.string().max(50),
    full_name: z.string().min(2).max(100),
    line1: z.string().min(1).max(200),
    line2: z.string().max(200),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postal_code: z.string().min(1).max(20),
    country: z.string().length(2),
    phone: z.string().max(20),
    is_default: z.boolean(),
  })
  .partial();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/addresses/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = updateAddressSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse({ error: parsed.error.flatten() }, 400);
    }

    const service = new AddressesService(supabase);
    const address = await service.update(id, user.id, parsed.data);
    return apiResponse(address);
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/addresses/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const service = new AddressesService(supabase);
    await service.delete(id, user.id);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error);
  }
}

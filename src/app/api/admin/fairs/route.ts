import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const fairSchema = z
  .object({
    name: z.string().min(2).max(200),
    location: z.string().min(2).max(200),
    province: z.string().min(2).max(100),
    start_date: z
      .string()
      .refine((d) => !isNaN(Date.parse(d)), {
        message: "Fecha de inicio inválida",
      }),
    end_date: z
      .string()
      .refine((d) => !isNaN(Date.parse(d)), {
        message: "Fecha de fin inválida",
      }),
    description: z.string().max(1000).optional(),
    image_url: z.string().url().optional(),
    website_url: z.string().url().optional(),
    is_verified: z.boolean().default(false),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["end_date"],
  });

// GET /api/admin/fairs — List all fairs
export async function GET() {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { data, error } = await supabaseAdmin
      .from("fairs")
      .select("*")
      .order("start_date", { ascending: true });

    if (error) return apiResponse({ error: "Error al obtener ferias" }, 500);
    return apiResponse({ data });
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/admin/fairs — Create fair
export async function POST(request: NextRequest) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const body = await request.json();
    const parsed = fairSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse({ error: parsed.error.flatten() }, 400);

    const { data, error } = await supabaseAdmin
      .from("fairs")
      .insert({ ...parsed.data, created_by: auth.userId })
      .select()
      .single();

    if (error) return apiResponse({ error: "Error al crear feria" }, 500);
    return apiResponse({ data }, 201);
  } catch (error) {
    return apiError(error);
  }
}

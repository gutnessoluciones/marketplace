import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse } from "@/lib/utils";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  subject: z.enum(["compra", "venta", "cuenta", "pagos", "sugerencia", "otro"]),
  message: z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse({ error: "Datos inválidos" }, 400);
    }

    const { name, email, subject, message } = parsed.data;

    // Store in DB
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name,
      email,
      subject,
      message,
    });

    if (error) {
      console.error("[CONTACT] Insert error:", error);
      return apiResponse({ error: "Error al guardar el mensaje" }, 500);
    }

    return apiResponse({ success: true }, 201);
  } catch {
    return apiResponse({ error: "Error del servidor" }, 500);
  }
}

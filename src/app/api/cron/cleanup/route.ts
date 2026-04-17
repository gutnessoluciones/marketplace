import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/cron/cleanup — Limpieza automática
// Llamar desde Vercel Cron Jobs cada 15 minutos
// En vercel.json: { "crons": [{ "path": "/api/cron/cleanup", "schedule": "*/15 * * * *" }] }
export async function GET(request: NextRequest) {
  // Verificar que viene de Vercel Cron o con authorization header
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // 1. Cancelar órdenes pending > 30 minutos y restaurar stock
  try {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: staleOrders } = await supabaseAdmin
      .from("orders")
      .select("id, product_id, quantity")
      .eq("status", "pending")
      .lt("created_at", thirtyMinAgo);

    if (staleOrders?.length) {
      for (const order of staleOrders) {
        // Restaurar stock
        await supabaseAdmin.rpc("increment_stock", {
          p_id: order.product_id,
          qty: order.quantity,
        });
        // Cancelar orden
        await supabaseAdmin
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", order.id)
          .eq("status", "pending"); // double-check to avoid race
      }
      results.cancelled_orders = staleOrders.length;
    } else {
      results.cancelled_orders = 0;
    }
  } catch (error) {
    results.cancelled_orders_error = String(error);
  }

  // 2. Escalar disputas abiertas > 7 días a "in_review"
  try {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: oldDisputes, error } = await supabaseAdmin
      .from("disputes")
      .update({ status: "in_review" })
      .eq("status", "open")
      .lt("created_at", sevenDaysAgo)
      .select("id");

    results.escalated_disputes = error ? 0 : (oldDisputes?.length ?? 0);
  } catch (error) {
    results.escalated_disputes_error = String(error);
  }

  // 3. Expirar ofertas pendientes
  try {
    await supabaseAdmin.rpc("expire_pending_offers");
    results.offers_expired = true;
  } catch {
    results.offers_expired = false;
  }

  return NextResponse.json({ ok: true, ...results });
}

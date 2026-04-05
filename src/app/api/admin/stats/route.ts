import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";

// GET /api/admin/stats — Get dashboard stats
export async function GET() {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const [users, products, orders, revenue] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("products")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("orders")
        .select("total_amount, platform_fee")
        .in("status", ["paid", "shipped", "delivered"]),
    ]);

    const totalRevenue =
      revenue.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) ?? 0;
    const totalFees =
      revenue.data?.reduce((sum, o) => sum + (o.platform_fee || 0), 0) ?? 0;

    return apiResponse({
      users: users.count ?? 0,
      products: products.count ?? 0,
      orders: orders.count ?? 0,
      revenue: totalRevenue,
      platformFees: totalFees,
    });
  } catch (error) {
    return apiError(error);
  }
}

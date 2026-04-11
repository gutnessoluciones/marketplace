import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";

// GET /api/recommendations — Smart product recommendations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "8"), 20);
    const exclude = searchParams.get("exclude"); // product ID to exclude (e.g. current product)

    let recommendedIds = new Set<string>();
    let categoryPreferences: string[] = [];

    if (user) {
      // 1. Get categories from user's favorites
      const { data: favorites } = await supabaseAdmin
        .from("favorites")
        .select("product:products!inner(id, category)")
        .eq("user_id", user.id)
        .limit(20);

      if (favorites?.length) {
        const catCounts: Record<string, number> = {};
        for (const f of favorites) {
          const p = f.product as unknown as { id: string; category: string };
          if (p?.category) {
            catCounts[p.category] = (catCounts[p.category] || 0) + 1;
          }
        }
        categoryPreferences = Object.entries(catCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([cat]) => cat);
      }

      // 2. Get categories from user's recent orders
      if (categoryPreferences.length === 0) {
        const { data: orders } = await supabaseAdmin
          .from("orders")
          .select("product:products!inner(category)")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (orders?.length) {
          const cats = orders
            .map(
              (o) => (o.product as unknown as { category: string })?.category,
            )
            .filter(Boolean);
          categoryPreferences = [...new Set(cats)];
        }
      }

      // 3. Get user interests from profile
      const { data: interests } = await supabaseAdmin
        .from("user_interests")
        .select("interest")
        .eq("user_id", user.id);

      if (interests?.length) {
        for (const i of interests) {
          if (!categoryPreferences.includes(i.interest)) {
            categoryPreferences.push(i.interest);
          }
        }
      }
    }

    // Build recommendations query
    let query = supabaseAdmin
      .from("products")
      .select(
        "*, seller:profiles!seller_id(id, display_name, avatar_url, verification_status)",
      )
      .eq("status", "active");

    if (exclude) {
      query = query.neq("id", exclude);
    }

    // If we have category preferences, prioritize those
    if (categoryPreferences.length > 0) {
      // First, try to get products from preferred categories
      const { data: preferred } = await query
        .in("category", categoryPreferences)
        .order("likes_count", { ascending: false })
        .order("views_count", { ascending: false })
        .limit(limit);

      if (preferred?.length) {
        for (const p of preferred) {
          recommendedIds.add(p.id);
        }

        if (preferred.length >= limit) {
          return apiResponse({ data: preferred });
        }

        // Fill remaining with popular products
        const remaining = limit - preferred.length;
        const excludeIds = [...recommendedIds];
        if (exclude) excludeIds.push(exclude);

        const { data: extras } = await supabaseAdmin
          .from("products")
          .select(
            "*, seller:profiles!seller_id(id, display_name, avatar_url, verification_status)",
          )
          .eq("status", "active")
          .not("id", "in", `(${excludeIds.join(",")})`)
          .order("likes_count", { ascending: false })
          .order("views_count", { ascending: false })
          .limit(remaining);

        return apiResponse({ data: [...preferred, ...(extras ?? [])] });
      }
    }

    // Fallback: popular + newest mix
    const { data: popular } = await supabaseAdmin
      .from("products")
      .select(
        "*, seller:profiles!seller_id(id, display_name, avatar_url, verification_status)",
      )
      .eq("status", "active")
      .neq("id", exclude ?? "00000000-0000-0000-0000-000000000000")
      .order("likes_count", { ascending: false })
      .order("views_count", { ascending: false })
      .limit(limit);

    return apiResponse({ data: popular ?? [] });
  } catch (error) {
    return apiError(error);
  }
}

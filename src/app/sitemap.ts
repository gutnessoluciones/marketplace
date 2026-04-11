import type { MetadataRoute } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://marketplace-three-mu.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseAdmin();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/cookies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Active products
  const { data: products } = await supabase
    .from("products")
    .select("id, updated_at")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(5000);

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p: { id: string; updated_at: string }) => ({
    url: `${BASE_URL}/products/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Category pages
  const categories = [
    "feria",
    "camino",
    "complementos-flamencos",
    "invitada-flamenca",
    "moda-infantil",
    "equitacion",
    "zapatos",
  ];
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/products?category=${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Seller profiles
  const { data: sellers } = await supabase
    .from("profiles")
    .select("id, updated_at")
    .eq("role", "seller")
    .limit(1000);

  const sellerPages: MetadataRoute.Sitemap = (sellers ?? []).map((s: { id: string; updated_at: string }) => ({
    url: `${BASE_URL}/sellers/${s.id}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...sellerPages];
}

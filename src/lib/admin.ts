import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Fallback owner emails from env (comma-separated). Only used if admin_users table is empty
const OWNER_EMAILS = (process.env.ADMIN_OWNER_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function isAdmin(): Promise<{
  authorized: boolean;
  userId?: string;
  role?: "owner" | "dev" | "admin";
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authorized: false };

  // Check admin_users table first
  const { data: adminUser } = await supabaseAdmin
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (adminUser) {
    return {
      authorized: true,
      userId: user.id,
      role: adminUser.role as "owner" | "dev" | "admin",
    };
  }

  // Fallback to email check for owners
  if (user.email && OWNER_EMAILS.includes(user.email)) {
    return { authorized: true, userId: user.id, role: "owner" };
  }

  return { authorized: false };
}

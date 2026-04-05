import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

// GET /auth/confirm — Handle email confirmation link from Supabase
// The email template sends users here with token_hash and type
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error) {
      // Redirect to safe local path only
      const safePath =
        next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      return Response.redirect(new URL(safePath, request.url));
    }
  }

  // Verification failed — redirect to login with error
  return Response.redirect(new URL("/login?error=confirmation", request.url));
}

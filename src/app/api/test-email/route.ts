import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/email";
import { isEmailConfigured } from "@/lib/email";
import { welcomeTemplate } from "@/lib/email/templates";
import { apiResponse } from "@/lib/utils";

/**
 * POST /api/test-email — Send a test email via Microsoft Graph API.
 *
 * Protected: only accessible by admin users (owner/dev role) OR
 * in development environment via a secret key.
 *
 * Body: { to?: string }
 * - If `to` is omitted, sends to MS_REPLY_TO (info@flamencalia.com).
 */
export async function POST(request: NextRequest) {
  // Protection: admin-only in production, dev secret in development
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev) {
    const auth = await isAdmin();
    if (!auth.authorized || (auth.role !== "owner" && auth.role !== "dev")) {
      return apiResponse({ error: "Forbidden" }, 403);
    }
  } else {
    // In development, require a secret header to prevent accidental calls
    const secret = request.headers.get("x-test-secret");
    if (secret !== (process.env.TEST_EMAIL_SECRET || "flamencalia-dev-test")) {
      return apiResponse(
        { error: "Forbidden — set x-test-secret header" },
        403,
      );
    }
  }

  if (!isEmailConfigured()) {
    return apiResponse(
      {
        error: "Email not configured",
        details:
          "Missing MS_TENANT_ID, MS_CLIENT_ID, or MS_CLIENT_SECRET environment variables.",
      },
      500,
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const to =
      (body as { to?: string }).to ||
      process.env.MS_REPLY_TO ||
      "info@flamencalia.com";

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return apiResponse({ error: "Invalid email address" }, 400);
    }

    const sent = await sendEmail({
      to,
      subject: "🧪 Test Email — Flamencalia Graph API",
      html: welcomeTemplate("Desarrollador"),
      category: "test",
    });

    if (sent) {
      return apiResponse({
        success: true,
        message: `Test email sent to ${to} via Microsoft Graph API`,
      });
    } else {
      return apiResponse(
        {
          success: false,
          message:
            "Email sending failed. Check server logs for Graph API errors.",
        },
        500,
      );
    }
  } catch (error) {
    console.error("[TEST-EMAIL] Error:", error);
    return apiResponse({ error: "Internal server error" }, 500);
  }
}

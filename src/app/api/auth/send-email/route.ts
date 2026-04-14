import { NextRequest } from "next/server";
import { Webhook } from "standardwebhooks";
import { sendEmail } from "@/lib/email";
import {
  confirmationTemplate,
  passwordRecoveryTemplate,
} from "@/lib/email/templates";

/**
 * POST /api/auth/send-email — Supabase Auth "Send Email" Hook
 *
 * Replaces Supabase's built-in SMTP email sending with our
 * Microsoft Graph API implementation.
 *
 * Supabase calls this endpoint instead of sending emails via SMTP
 * for: signup confirmation, password recovery, magic link, email change, etc.
 *
 * Secured via Standard Webhooks signature verification.
 */

interface SendEmailHookPayload {
  user: {
    id: string;
    email: string;
    new_email?: string;
    user_metadata?: {
      display_name?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new: string;
    token_hash_new: string;
    old_email?: string;
    old_phone?: string;
    provider?: string;
    factor_type?: string;
  };
}

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
      ".supabase.co",
      ".vercel.app",
    ) ||
    "https://marketplace-three-mu.vercel.app"
  );
}

function buildConfirmUrl(
  baseUrl: string,
  tokenHash: string,
  type: string,
  redirectTo?: string,
): string {
  const url = new URL("/auth/confirm", baseUrl);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", type);
  if (redirectTo) {
    url.searchParams.set("next", redirectTo);
  } else {
    url.searchParams.set("next", "/dashboard");
  }
  return url.toString();
}

export async function POST(request: NextRequest) {
  const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET;

  if (!hookSecret) {
    console.error("[AUTH-HOOK] SEND_EMAIL_HOOK_SECRET not configured");
    return new Response(
      JSON.stringify({
        error: { http_code: 500, message: "Hook not configured" },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // Read raw body for signature verification
  const rawBody = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Verify webhook signature
  let payload: SendEmailHookPayload;
  try {
    const secret = hookSecret.replace("v1,whsec_", "");
    const wh = new Webhook(secret);
    payload = wh.verify(rawBody, headers) as SendEmailHookPayload;
  } catch (err) {
    console.error("[AUTH-HOOK] Signature verification failed:", err);
    return new Response(
      JSON.stringify({
        error: { http_code: 401, message: "Invalid signature" },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const { user, email_data } = payload;
  const baseUrl = getBaseUrl();
  const actionType = email_data.email_action_type;

  console.log(`[AUTH-HOOK] ${actionType} email for ${user.email}`);

  try {
    switch (actionType) {
      case "signup": {
        const confirmUrl = buildConfirmUrl(
          baseUrl,
          email_data.token_hash,
          "signup",
          email_data.redirect_to || undefined,
        );
        await sendEmail({
          to: user.email,
          subject: "Confirma tu cuenta en Flamencalia",
          html: confirmationTemplate(confirmUrl),
          category: "auth-signup",
        });
        break;
      }

      case "recovery": {
        const recoveryUrl = buildConfirmUrl(
          baseUrl,
          email_data.token_hash,
          "recovery",
        );
        await sendEmail({
          to: user.email,
          subject: "Restablecer contraseña — Flamencalia",
          html: passwordRecoveryTemplate(recoveryUrl),
          category: "auth-recovery",
        });
        break;
      }

      case "magic_link": {
        const magicUrl = buildConfirmUrl(
          baseUrl,
          email_data.token_hash,
          "magiclink",
          email_data.redirect_to || undefined,
        );
        await sendEmail({
          to: user.email,
          subject: "Tu enlace de acceso — Flamencalia",
          html: confirmationTemplate(magicUrl),
          category: "auth-magiclink",
        });
        break;
      }

      case "invite": {
        const inviteUrl = buildConfirmUrl(
          baseUrl,
          email_data.token_hash,
          "invite",
          email_data.redirect_to || undefined,
        );
        await sendEmail({
          to: user.email,
          subject: "Te han invitado a Flamencalia",
          html: confirmationTemplate(inviteUrl),
          category: "auth-invite",
        });
        break;
      }

      case "email_change": {
        // When Secure Email Change is enabled, two emails are needed.
        // Field naming is counterintuitive (see Supabase docs):
        //   token_hash_new → current email (user.email) with token
        //   token_hash     → new email (user.new_email) with token_new

        if (email_data.token_hash_new && user.email) {
          // Email to CURRENT address
          const currentUrl = buildConfirmUrl(
            baseUrl,
            email_data.token_hash_new,
            "email_change",
          );
          await sendEmail({
            to: user.email,
            subject: "Confirma el cambio de email — Flamencalia",
            html: confirmationTemplate(currentUrl),
            category: "auth-email-change",
          });
        }

        if (email_data.token_hash && user.new_email) {
          // Email to NEW address
          const newUrl = buildConfirmUrl(
            baseUrl,
            email_data.token_hash,
            "email_change",
          );
          await sendEmail({
            to: user.new_email,
            subject: "Confirma tu nuevo email — Flamencalia",
            html: confirmationTemplate(newUrl),
            category: "auth-email-change",
          });
        } else if (email_data.token_hash && !user.new_email) {
          // Secure email change disabled — single email
          const changeUrl = buildConfirmUrl(
            baseUrl,
            email_data.token_hash,
            "email_change",
          );
          await sendEmail({
            to: user.email,
            subject: "Confirma el cambio de email — Flamencalia",
            html: confirmationTemplate(changeUrl),
            category: "auth-email-change",
          });
        }
        break;
      }

      case "reauthentication": {
        await sendEmail({
          to: user.email,
          subject: `Tu código de verificación: ${email_data.token}`,
          html: confirmationTemplate("#"),
          category: "auth-reauth",
        });
        break;
      }

      default:
        console.warn(`[AUTH-HOOK] Unknown email_action_type: ${actionType}`);
    }

    console.log(`[AUTH-HOOK] ✓ ${actionType} email sent to ${user.email}`);
  } catch (error) {
    console.error(`[AUTH-HOOK] Failed to send ${actionType} email:`, error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: "Failed to send email",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // Success — empty JSON response
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

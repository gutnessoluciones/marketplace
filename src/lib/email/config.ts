/**
 * Email configuration — validates and exports environment variables
 * for Microsoft Graph API email sending.
 */

export interface EmailConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  sender: string;
  replyTo: string;
  baseUrl: string;
}

let cachedConfig: EmailConfig | null = null;

/**
 * Validates and returns the email configuration from environment variables.
 * Throws a descriptive error if any required variable is missing.
 */
export function getEmailConfig(): EmailConfig {
  if (cachedConfig) return cachedConfig;

  const required: Record<string, string | undefined> = {
    MS_TENANT_ID: process.env.MS_TENANT_ID,
    MS_CLIENT_ID: process.env.MS_CLIENT_ID,
    MS_CLIENT_SECRET: process.env.MS_CLIENT_SECRET,
  };

  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `[EMAIL] Missing required environment variables: ${missing.join(", ")}. ` +
        "Ensure Microsoft Entra app registration is configured.",
    );
  }

  cachedConfig = {
    tenantId: required.MS_TENANT_ID!,
    clientId: required.MS_CLIENT_ID!,
    clientSecret: required.MS_CLIENT_SECRET!,
    sender: process.env.MS_SENDER || "noreply@flamencalia.com",
    replyTo: process.env.MS_REPLY_TO || "info@flamencalia.com",
    baseUrl:
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://flamencalia.com",
  };

  return cachedConfig;
}

/**
 * Returns true if the email system is configured (env vars present).
 * Does not throw — safe for conditional checks.
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.MS_TENANT_ID &&
    process.env.MS_CLIENT_ID &&
    process.env.MS_CLIENT_SECRET
  );
}

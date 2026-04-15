/**
 * Email configuration — validates and exports environment variables
 * for Brevo (formerly Sendinblue) transactional email API.
 */

export interface EmailConfig {
  apiKey: string;
  senderEmail: string;
  senderName: string;
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

  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error(
      "[EMAIL] Missing required environment variable: BREVO_API_KEY. " +
        "Get your API key from https://app.brevo.com/settings/keys/api",
    );
  }

  cachedConfig = {
    apiKey,
    senderEmail: process.env.BREVO_SENDER_EMAIL || "noreply@flamencalia.com",
    senderName: process.env.BREVO_SENDER_NAME || "Flamencalia",
    replyTo: process.env.BREVO_REPLY_TO || "info@flamencalia.com",
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
  return !!process.env.BREVO_API_KEY;
}

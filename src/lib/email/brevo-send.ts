/**
 * Brevo (formerly Sendinblue) transactional email sender.
 * Uses the Brevo REST API v3 — no SDK needed, just fetch.
 *
 * API docs: https://developers.brevo.com/reference/sendtransacemail
 */

import { getEmailConfig } from "./config";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoAttachment {
  name: string;
  content: string; // base64
  contentType?: string;
}

export interface SendBrevoMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: BrevoAttachment[];
  tags?: string[];
}

function toRecipients(addresses: string | string[]): BrevoRecipient[] {
  const list = Array.isArray(addresses) ? addresses : [addresses];
  return list.map((addr) => ({ email: addr.trim() }));
}

/**
 * Sends an email via Brevo's transactional email API.
 *
 * @throws Error if the API call fails
 */
export async function sendBrevoMail(
  options: SendBrevoMailOptions,
): Promise<void> {
  const config = getEmailConfig();

  const body: Record<string, unknown> = {
    sender: {
      email: config.senderEmail,
      name: config.senderName,
    },
    to: toRecipients(options.to),
    subject: options.subject,
    htmlContent: options.html,
  };

  if (options.text) {
    body.textContent = options.text;
  }

  const replyTo = options.replyTo ?? config.replyTo;
  body.replyTo = { email: replyTo };

  if (options.cc?.length) {
    body.cc = toRecipients(options.cc);
  }

  if (options.bcc?.length) {
    body.bcc = toRecipients(options.bcc);
  }

  if (options.attachments?.length) {
    body.attachment = options.attachments.map((a) => ({
      name: a.name,
      content: a.content,
    }));
  }

  if (options.tags?.length) {
    body.tags = options.tags;
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": config.apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const statusCode = response.status;

    if (statusCode === 401) {
      console.error("[EMAIL] ✗ Authentication failed — check BREVO_API_KEY.");
    } else if (statusCode === 400) {
      console.error(
        `[EMAIL] ✗ Bad request — check sender/recipient. Response: ${errorBody}`,
      );
    } else if (statusCode === 429) {
      console.error("[EMAIL] ✗ Rate limited by Brevo. Retry after delay.");
    } else {
      console.error(`[EMAIL] ✗ Brevo API error (${statusCode}): ${errorBody}`);
    }

    throw new Error(
      `Email delivery failed: HTTP ${statusCode}. Check server logs for details.`,
    );
  }

  const result = (await response.json()) as { messageId?: string };

  console.log(
    `[EMAIL] ✓ Sent to ${Array.isArray(options.to) ? options.to.join(", ") : options.to} — "${options.subject}" (messageId: ${result.messageId ?? "n/a"})`,
  );
}

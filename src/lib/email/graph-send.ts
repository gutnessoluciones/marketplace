/**
 * Microsoft Graph email sending service.
 * Handles the low-level Graph API call to POST /users/{sender}/sendMail.
 */

import { getGraphClient } from "./graph-client";
import { getEmailConfig } from "./config";

export interface GraphMailRecipient {
  emailAddress: {
    address: string;
    name?: string;
  };
}

export interface GraphFileAttachment {
  "@odata.type": "#microsoft.graph.fileAttachment";
  name: string;
  contentType: string;
  contentBytes: string; // base64
}

export interface SendGraphMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: GraphFileAttachment[];
  saveToSentItems?: boolean;
  category?: string;
}

function toRecipients(addresses: string | string[]): GraphMailRecipient[] {
  const list = Array.isArray(addresses) ? addresses : [addresses];
  return list.map((addr) => ({
    emailAddress: { address: addr.trim() },
  }));
}

/**
 * Sends an email via Microsoft Graph API.
 * Uses POST /users/{sender}/sendMail with the configured sender mailbox.
 *
 * @throws Error if Graph API call fails (token, permissions, mailbox issues)
 */
export async function sendGraphMail(
  options: SendGraphMailOptions,
): Promise<void> {
  const config = getEmailConfig();
  const client = getGraphClient();

  const replyTo = options.replyTo ?? config.replyTo;

  // Build the Graph API message payload
  // See: https://learn.microsoft.com/en-us/graph/api/user-sendmail
  const message: Record<string, unknown> = {
    subject: options.subject,
    body: {
      contentType: "HTML",
      content: options.html,
    },
    toRecipients: toRecipients(options.to),
    from: {
      emailAddress: { address: config.sender },
    },
    replyTo: [
      {
        emailAddress: { address: replyTo },
      },
    ],
  };

  // Optional plain text — Graph doesn't support multipart; we include it
  // as an alternate body only if explicitly provided. HTML takes priority.
  // For recipients whose client prefers plain text, we rely on the HTML body
  // rendering. Plain text can be added via an attachment if needed.

  if (options.cc?.length) {
    message.ccRecipients = toRecipients(options.cc);
  }

  if (options.bcc?.length) {
    message.bccRecipients = toRecipients(options.bcc);
  }

  if (options.attachments?.length) {
    message.attachments = options.attachments;
  }

  if (options.category) {
    message.categories = [options.category];
  }

  const payload = {
    message,
    saveToSentItems: options.saveToSentItems ?? true,
  };

  try {
    await client.api(`/users/${config.sender}/sendMail`).post(payload);

    console.log(
      `[EMAIL] ✓ Sent to ${Array.isArray(options.to) ? options.to.join(", ") : options.to} — "${options.subject}"`,
    );
  } catch (error: unknown) {
    // Classify and log the error without exposing secrets
    const graphError = error as {
      statusCode?: number;
      code?: string;
      message?: string;
      body?: string;
    };

    const statusCode = graphError.statusCode ?? 0;
    const code = graphError.code ?? "UNKNOWN";
    const msg = graphError.message ?? "Unknown Graph API error";

    // Specific error classification for debugging
    if (statusCode === 401 || code === "InvalidAuthenticationToken") {
      console.error(
        "[EMAIL] ✗ Authentication failed — check MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET.",
        `Code: ${code}`,
      );
    } else if (statusCode === 403 || code === "Authorization_RequestDenied") {
      console.error(
        "[EMAIL] ✗ Permission denied — ensure Mail.Send (Application) permission is granted with admin consent.",
        `Code: ${code}`,
      );
    } else if (
      statusCode === 404 ||
      code === "MailboxNotFound" ||
      code === "ResourceNotFound"
    ) {
      console.error(
        `[EMAIL] ✗ Mailbox not found — verify that "${config.sender}" exists as a mailbox or shared mailbox in Microsoft 365.`,
        `Code: ${code}`,
      );
    } else if (statusCode === 429) {
      console.error(
        "[EMAIL] ✗ Rate limited by Microsoft Graph. Retry after delay.",
        `Code: ${code}`,
      );
    } else {
      console.error(
        `[EMAIL] ✗ Graph API error (${statusCode}): ${code} — ${msg}`,
      );
    }

    throw new Error(
      `Email delivery failed: ${code} (${statusCode}). Check server logs for details.`,
    );
  }
}

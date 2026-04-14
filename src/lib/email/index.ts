/**
 * Flamencalia Email Service — Microsoft Graph API
 *
 * Central email module. All email sending in the application goes through here.
 * Uses Microsoft Graph API with OAuth 2.0 client credentials flow.
 *
 * Usage:
 *   import { sendEmail, sendOfferReceivedEmail } from "@/lib/email";
 */

import { sendGraphMail, type SendGraphMailOptions } from "./graph-send";
import { isEmailConfigured } from "./config";
import {
  welcomeTemplate,
  confirmationTemplate,
  passwordRecoveryTemplate,
  orderConfirmationTemplate,
  offerReceivedTemplate,
  offerAcceptedTemplate,
  offerCounteredTemplate,
  orderStatusTemplate,
  newMessageTemplate,
  disputeOpenedTemplate,
  adminAlertTemplate,
} from "./templates";

// ── Core send function ──────────────────────────────────────────────

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  category?: string;
}

/**
 * Send an email via Microsoft Graph API.
 * Fire-and-forget safe: returns boolean, never throws.
 * Logs errors server-side for debugging.
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.log(
      `[EMAIL] Graph API not configured — would send to ${Array.isArray(options.to) ? options.to.join(", ") : options.to}: "${options.subject}"`,
    );
    return true; // Don't block flows when email is not configured
  }

  try {
    const graphOptions: SendGraphMailOptions = {
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      category: options.category,
      saveToSentItems: true,
    };

    await sendGraphMail(graphOptions);
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send:", error);
    return false;
  }
}

// ── High-level email functions (drop-in replacements) ───────────────

export async function sendWelcomeEmail(
  to: string,
  displayName: string,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: "¡Bienvenid@ a Flamencalia!",
    html: welcomeTemplate(displayName),
    category: "welcome",
  });
}

export async function sendConfirmationEmail(
  to: string,
  confirmUrl: string,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: "Confirma tu email — Flamencalia",
    html: confirmationTemplate(confirmUrl),
    category: "confirmation",
  });
}

export async function sendPasswordRecoveryEmail(
  to: string,
  resetUrl: string,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: "Restablecer contraseña — Flamencalia",
    html: passwordRecoveryTemplate(resetUrl),
    category: "recovery",
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  productTitle: string,
  amount: number,
  orderId: string,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: "¡Pedido confirmado! — Flamencalia",
    html: orderConfirmationTemplate(productTitle, amount, orderId),
    category: "order",
  });
}

export async function sendOfferReceivedEmail(
  to: string,
  productTitle: string,
  amount: number,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Nueva oferta en "${productTitle}"`,
    html: offerReceivedTemplate(productTitle, amount),
    category: "offer",
  });
}

export async function sendOfferAcceptedEmail(
  to: string,
  productTitle: string,
  amount: number,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: "¡Tu oferta ha sido aceptada!",
    html: offerAcceptedTemplate(productTitle, amount),
    category: "offer",
  });
}

export async function sendOfferCounteredEmail(
  to: string,
  productTitle: string,
  counterAmount: number,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: "Contraoferta recibida",
    html: offerCounteredTemplate(productTitle, counterAmount),
    category: "offer",
  });
}

export async function sendOrderStatusEmail(
  to: string,
  productTitle: string,
  status: string,
  orderId: string,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Tu pedido ha sido ${status === "shipped" ? "enviado" : status === "delivered" ? "entregado" : "actualizado"}`,
    html: orderStatusTemplate(productTitle, status, orderId),
    category: "order",
  });
}

export async function sendNewMessageEmail(
  to: string,
  senderName: string,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Nuevo mensaje de ${senderName}`,
    html: newMessageTemplate(senderName),
    category: "message",
  });
}

export async function sendDisputeOpenedEmail(
  to: string,
  orderId: string,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: "Se ha abierto una disputa",
    html: disputeOpenedTemplate(orderId),
    category: "dispute",
  });
}

export async function sendAdminAlertEmail(
  recipients: string[],
  alerts: Array<{
    service: string;
    metric: string;
    percent: number;
    level: string;
    message: string;
  }>,
): Promise<boolean> {
  return sendEmail({
    to: recipients,
    subject: `⚠️ Alerta servicios: ${alerts.length} aviso(s) — Flamencalia`,
    html: adminAlertTemplate(alerts),
    category: "admin-alert",
  });
}

// Re-export config utilities
export { isEmailConfigured } from "./config";

/**
 * Email notification utility — Office365 SMTP via nodemailer
 * Fire-and-forget: never throws, just logs errors.
 */

import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.office365.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL =
  process.env.FROM_EMAIL || "Flamencalia <soporte@flamencalia.com>";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://flamencalia.com";

const transporter =
  SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: false, // STARTTLS
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        tls: { ciphers: "SSLv3" },
      })
    : null;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!transporter) {
    console.log(
      `[EMAIL] SMTP not configured — would send to ${payload.to}: ${payload.subject}`,
    );
    return true;
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return true;
  } catch (err) {
    console.error("[EMAIL] Failed to send:", err);
    return false;
  }
}

function baseTemplate(
  title: string,
  body: string,
  ctaUrl?: string,
  ctaText?: string,
) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fff9f0;padding:40px 20px;margin:0;">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <div style="background:#1a1a1a;padding:20px 24px;text-align:center;">
      <span style="font-family:Georgia,serif;color:white;font-size:18px;letter-spacing:2px;">FLAMENCALIA</span>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;">${title}</h2>
      ${body}
      ${
        ctaUrl
          ? `<div style="margin:24px 0;text-align:center;">
        <a href="${ctaUrl}" style="display:inline-block;background:#d4a843;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${ctaText ?? "Ver detalles"}</a>
      </div>`
          : ""
      }
    </div>
    <div style="padding:16px 24px;background:#faf5ee;text-align:center;">
      <p style="color:#999;font-size:11px;margin:0;">© ${new Date().getFullYear()} Flamencalia · "Larga vida a tu Flamenca"</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Notification Types ───────────────────────

export async function sendOfferReceivedEmail(
  to: string,
  productTitle: string,
  amount: number,
) {
  return sendEmail({
    to,
    subject: `Nueva oferta en "${productTitle}"`,
    html: baseTemplate(
      "Has recibido una oferta",
      `<p style="color:#555;line-height:1.6;">Alguien ha hecho una oferta de <strong style="color:#1a1a1a;">${(amount / 100).toFixed(2)}€</strong> en tu producto <strong>"${productTitle}"</strong>.</p>
       <p style="color:#555;">Tienes 48 horas para responder.</p>`,
      `${BASE_URL}/dashboard/offers`,
      "Ver ofertas",
    ),
  });
}

export async function sendOfferAcceptedEmail(
  to: string,
  productTitle: string,
  amount: number,
) {
  return sendEmail({
    to,
    subject: "¡Tu oferta ha sido aceptada!",
    html: baseTemplate(
      "¡Oferta aceptada!",
      `<p style="color:#555;line-height:1.6;">Tu oferta de <strong style="color:#1a1a1a;">${(amount / 100).toFixed(2)}€</strong> para <strong>"${productTitle}"</strong> ha sido aceptada.</p>
       <p style="color:#555;">Procede al pago para completar la compra.</p>`,
      `${BASE_URL}/dashboard/offers`,
      "Ir al pago",
    ),
  });
}

export async function sendOfferCounteredEmail(
  to: string,
  productTitle: string,
  counterAmount: number,
) {
  return sendEmail({
    to,
    subject: "Contraoferta recibida",
    html: baseTemplate(
      "Contraoferta del vendedor",
      `<p style="color:#555;line-height:1.6;">El vendedor te propone <strong style="color:#1a1a1a;">${(counterAmount / 100).toFixed(2)}€</strong> como contraoferta para <strong>"${productTitle}"</strong>.</p>`,
      `${BASE_URL}/dashboard/offers`,
      "Responder",
    ),
  });
}

export async function sendOrderStatusEmail(
  to: string,
  productTitle: string,
  status: string,
  orderId: string,
) {
  const statusLabels: Record<string, string> = {
    paid: "confirmado",
    shipped: "enviado",
    delivered: "entregado",
  };
  const label = statusLabels[status] ?? status;

  return sendEmail({
    to,
    subject: `Tu pedido ha sido ${label}`,
    html: baseTemplate(
      `Pedido ${label}`,
      `<p style="color:#555;line-height:1.6;">Tu pedido de <strong>"${productTitle}"</strong> ha sido marcado como <strong>${label}</strong>.</p>`,
      `${BASE_URL}/dashboard/orders/${orderId}`,
      "Ver pedido",
    ),
  });
}

export async function sendNewMessageEmail(to: string, senderName: string) {
  return sendEmail({
    to,
    subject: `Nuevo mensaje de ${senderName}`,
    html: baseTemplate(
      "Nuevo mensaje",
      `<p style="color:#555;line-height:1.6;">Has recibido un nuevo mensaje de <strong>${senderName}</strong>.</p>`,
      `${BASE_URL}/dashboard/chat`,
      "Ir al chat",
    ),
  });
}

export async function sendDisputeOpenedEmail(to: string, orderId: string) {
  return sendEmail({
    to,
    subject: "Se ha abierto una disputa",
    html: baseTemplate(
      "Disputa abierta",
      `<p style="color:#555;line-height:1.6;">Se ha abierto una disputa en uno de tus pedidos. Nuestro equipo la revisará pronto.</p>`,
      `${BASE_URL}/dashboard/orders/${orderId}`,
      "Ver pedido",
    ),
  });
}

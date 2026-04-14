/**
 * Flamencalia email templates — responsive HTML email layouts.
 * All templates use inline styles for maximum email client compatibility.
 */

import { getEmailConfig } from "./config";

const BRAND = {
  red: "#c8102e",
  albero: "#d4a843",
  cream: "#fff9f0",
  dark: "#1a1a1a",
  gray: "#555",
  lightGray: "#999",
} as const;

/**
 * Base layout wrapper for all Flamencalia emails.
 * Provides consistent header, body container, and footer.
 */
export function layoutTemplate(content: string): string {
  const year = new Date().getFullYear();
  const config = getEmailConfig();
  const imgBase = config.baseUrl;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Flamencalia</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.cream};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND.dark};padding:20px 24px;text-align:center;">
              <img src="${imgBase}/email/logo-email.png" alt="Flamencalia" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;background:#faf5ee;text-align:center;border-top:1px solid #f0e8d8;">
              <img src="${imgBase}/email/slogan-email.png" alt="Larga vida a tu Flamenca" width="140" style="display:block;margin:0 auto 8px;max-width:140px;height:auto;" />
              <p style="color:${BRAND.lightGray};font-size:11px;margin:0;line-height:1.4;">
                &copy; ${year} Flamencalia &middot; Todos los derechos reservados
              </p>
              <p style="color:${BRAND.lightGray};font-size:10px;margin:4px 0 0;">
                Si no solicitaste este email, puedes ignorarlo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Reusable CTA button */
function ctaButton(url: string, text: string): string {
  return `<div style="margin:24px 0;text-align:center;">
    <a href="${url}" target="_blank" style="display:inline-block;background:${BRAND.albero};color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.3px;">${text}</a>
  </div>`;
}

/** Reusable paragraph */
function p(text: string): string {
  return `<p style="color:${BRAND.gray};font-size:14px;line-height:1.6;margin:0 0 12px;">${text}</p>`;
}

/** Title */
function h2(text: string): string {
  return `<h2 style="color:${BRAND.dark};font-size:20px;font-weight:700;margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;">${text}</h2>`;
}

// ── Template Functions ──────────────────────────────────────────────

export function welcomeTemplate(displayName: string): string {
  const config = getEmailConfig();
  return layoutTemplate(
    h2(`¡Bienvenid@ a Flamencalia, ${displayName}!`) +
      p(
        "Nos alegra mucho que formes parte de nuestra comunidad de moda flamenca.",
      ) +
      p(
        "En Flamencalia podrás comprar y vender trajes de flamenca, complementos y mucho más. Cada prenda tiene una historia — ayúdanos a darle una nueva vida.",
      ) +
      ctaButton(`${config.baseUrl}/products`, "Explorar productos") +
      p(
        "Si tienes cualquier duda, escríbenos a <strong>info@flamencalia.com</strong>. ¡Estamos para ayudarte!",
      ),
  );
}

export function confirmationTemplate(confirmUrl: string): string {
  return layoutTemplate(
    h2("Confirma tu email") +
      p(
        "Gracias por registrarte en Flamencalia. Para completar tu registro, confirma tu dirección de correo electrónico pulsando el botón de abajo.",
      ) +
      ctaButton(confirmUrl, "Confirmar email") +
      p(
        "Si no creaste una cuenta en Flamencalia, puedes ignorar este mensaje.",
      ) +
      `<p style="color:${BRAND.lightGray};font-size:11px;margin:16px 0 0;word-break:break-all;">Si el botón no funciona, copia y pega este enlace: ${confirmUrl}</p>`,
  );
}

export function passwordRecoveryTemplate(resetUrl: string): string {
  return layoutTemplate(
    h2("Restablecer contraseña") +
      p(
        "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Flamencalia.",
      ) +
      ctaButton(resetUrl, "Restablecer contraseña") +
      p(
        "Este enlace expirará en 1 hora. Si no solicitaste cambiar tu contraseña, ignora este email.",
      ) +
      `<p style="color:${BRAND.lightGray};font-size:11px;margin:16px 0 0;word-break:break-all;">Enlace directo: ${resetUrl}</p>`,
  );
}

export function orderConfirmationTemplate(
  productTitle: string,
  amount: number,
  orderId: string,
): string {
  const config = getEmailConfig();
  return layoutTemplate(
    h2("¡Pedido confirmado!") +
      p(
        `Tu compra de <strong>&ldquo;${productTitle}&rdquo;</strong> se ha procesado correctamente.`,
      ) +
      `<div style="background:${BRAND.cream};border-radius:8px;padding:16px;margin:16px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:${BRAND.gray};">
          <tr><td style="padding:4px 0;"><strong>Producto:</strong></td><td style="padding:4px 0;text-align:right;">${productTitle}</td></tr>
          <tr><td style="padding:4px 0;"><strong>Total:</strong></td><td style="padding:4px 0;text-align:right;font-weight:700;color:${BRAND.dark};">${(amount / 100).toFixed(2)}&euro;</td></tr>
          <tr><td style="padding:4px 0;"><strong>Pedido:</strong></td><td style="padding:4px 0;text-align:right;font-size:12px;">${orderId.slice(0, 8)}...</td></tr>
        </table>
      </div>` +
      ctaButton(
        `${config.baseUrl}/dashboard/orders/${orderId}`,
        "Ver mi pedido",
      ) +
      p("Te avisaremos cuando el vendedor envíe tu pedido."),
  );
}

export function offerReceivedTemplate(
  productTitle: string,
  amount: number,
): string {
  const config = getEmailConfig();
  return layoutTemplate(
    h2("Has recibido una oferta") +
      p(
        `Alguien ha hecho una oferta de <strong style="color:${BRAND.dark};">${(amount / 100).toFixed(2)}&euro;</strong> en tu producto <strong>&ldquo;${productTitle}&rdquo;</strong>.`,
      ) +
      p("Tienes 48 horas para responder.") +
      ctaButton(`${config.baseUrl}/dashboard/offers`, "Ver ofertas"),
  );
}

export function offerAcceptedTemplate(
  productTitle: string,
  amount: number,
): string {
  const config = getEmailConfig();
  return layoutTemplate(
    h2("¡Oferta aceptada!") +
      p(
        `Tu oferta de <strong style="color:${BRAND.dark};">${(amount / 100).toFixed(2)}&euro;</strong> para <strong>&ldquo;${productTitle}&rdquo;</strong> ha sido aceptada.`,
      ) +
      p("Procede al pago para completar la compra.") +
      ctaButton(`${config.baseUrl}/dashboard/offers`, "Ir al pago"),
  );
}

export function offerCounteredTemplate(
  productTitle: string,
  counterAmount: number,
): string {
  const config = getEmailConfig();
  return layoutTemplate(
    h2("Contraoferta del vendedor") +
      p(
        `El vendedor te propone <strong style="color:${BRAND.dark};">${(counterAmount / 100).toFixed(2)}&euro;</strong> como contraoferta para <strong>&ldquo;${productTitle}&rdquo;</strong>.`,
      ) +
      ctaButton(`${config.baseUrl}/dashboard/offers`, "Responder"),
  );
}

export function orderStatusTemplate(
  productTitle: string,
  status: string,
  orderId: string,
): string {
  const config = getEmailConfig();
  const statusLabels: Record<string, string> = {
    paid: "confirmado",
    shipped: "enviado",
    delivered: "entregado",
  };
  const label = statusLabels[status] ?? status;

  return layoutTemplate(
    h2(`Pedido ${label}`) +
      p(
        `Tu pedido de <strong>&ldquo;${productTitle}&rdquo;</strong> ha sido marcado como <strong>${label}</strong>.`,
      ) +
      ctaButton(`${config.baseUrl}/dashboard/orders/${orderId}`, "Ver pedido"),
  );
}

export function newMessageTemplate(senderName: string): string {
  const config = getEmailConfig();
  return layoutTemplate(
    h2("Nuevo mensaje") +
      p(`Has recibido un nuevo mensaje de <strong>${senderName}</strong>.`) +
      ctaButton(`${config.baseUrl}/dashboard/chat`, "Ir al chat"),
  );
}

export function disputeOpenedTemplate(orderId: string): string {
  const config = getEmailConfig();
  return layoutTemplate(
    h2("Disputa abierta") +
      p(
        "Se ha abierto una disputa en uno de tus pedidos. Nuestro equipo la revisará pronto.",
      ) +
      ctaButton(`${config.baseUrl}/dashboard/orders/${orderId}`, "Ver pedido"),
  );
}

export function adminAlertTemplate(
  alerts: Array<{
    service: string;
    metric: string;
    percent: number;
    level: string;
    message: string;
  }>,
): string {
  const config = getEmailConfig();
  const rows = alerts
    .map(
      (a) =>
        `<tr style="border-bottom:1px solid #eee;">
          <td style="padding:8px 12px;font-weight:600;color:${a.level === "critical" ? BRAND.red : BRAND.albero};">${a.level === "critical" ? "🔴" : "🟡"} ${a.service}</td>
          <td style="padding:8px 12px;">${a.metric}</td>
          <td style="padding:8px 12px;text-align:center;font-weight:700;">${a.percent}%</td>
          <td style="padding:8px 12px;">${a.message}</td>
        </tr>`,
    )
    .join("");

  return layoutTemplate(
    `<h2 style="color:${BRAND.red};font-size:20px;font-weight:700;margin:0 0 16px;">⚠️ Alerta de Servicios</h2>` +
      p(
        `Se han detectado <strong>${alerts.length}</strong> alerta(s) en los servicios:`,
      ) +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin:16px 0;border-collapse:collapse;">
        <thead><tr style="background:#f5f5f5;"><th style="padding:8px 12px;text-align:left;">Servicio</th><th style="padding:8px 12px;text-align:left;">Métrica</th><th style="padding:8px 12px;text-align:center;">Uso</th><th style="padding:8px 12px;text-align:left;">Detalle</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>` +
      ctaButton(`${config.baseUrl}/flamencadmin-8x9k2m/dev`, "Ver Zona Dev"),
  );
}

import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";

// POST /api/admin/dev-stats/alert — Send alert email when approaching limits
export async function POST(request: Request) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized || (auth.role !== "owner" && auth.role !== "dev")) {
      return apiResponse({ error: "Forbidden" }, 403);
    }

    const body = await request.json();
    const { alerts, recipients } = body as {
      alerts: Array<{
        service: string;
        metric: string;
        percent: number;
        level: string;
        message: string;
      }>;
      recipients: string[];
    };

    if (!alerts?.length) {
      return apiResponse({ error: "No alerts to send" }, 400);
    }
    if (!recipients?.length) {
      return apiResponse({ error: "No recipients" }, 400);
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return apiResponse(
        { error: "RESEND_API_KEY no configurado en el servidor" },
        500,
      );
    }

    // Build email HTML
    const alertRows = alerts
      .map(
        (a) =>
          `<tr style="border-bottom:1px solid #eee">
            <td style="padding:8px 12px;font-weight:600;color:${a.level === "critical" ? "#c8102e" : "#d4a843"}">${a.level === "critical" ? "🔴" : "🟡"} ${a.service}</td>
            <td style="padding:8px 12px">${a.metric}</td>
            <td style="padding:8px 12px;text-align:center;font-weight:700">${a.percent}%</td>
            <td style="padding:8px 12px">${a.message}</td>
          </tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff9f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1a1a1a,#c8102e);padding:24px 32px">
          <h1 style="color:#fff;margin:0;font-size:20px">⚠️ Alerta de Servicios — Flamencalia</h1>
          <p style="color:#d4a843;margin:4px 0 0;font-size:13px">Zona Desarrolladores</p>
        </div>
        <div style="padding:24px 32px">
          <p style="color:#333;font-size:14px">Se han detectado <strong>${alerts.length}</strong> alerta(s) en los servicios:</p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:8px 12px;text-align:left">Servicio</th>
                <th style="padding:8px 12px;text-align:left">Métrica</th>
                <th style="padding:8px 12px;text-align:center">Uso</th>
                <th style="padding:8px 12px;text-align:left">Detalle</th>
              </tr>
            </thead>
            <tbody>${alertRows}</tbody>
          </table>
          <p style="color:#666;font-size:13px">Revisa la <a href="${process.env.NEXT_PUBLIC_APP_URL}/flamencadmin-8x9k2m/dev" style="color:#c8102e">Zona Dev</a> para más detalles.</p>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:11px;color:#999">
          Email automático de Flamencalia — No responder
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Flamencalia Dev <onboarding@resend.dev>",
        to: recipients,
        subject: `⚠️ Alerta servicios: ${alerts.length} aviso(s) — Flamencalia`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return apiResponse(
        {
          error: "Error enviando email",
          detail: err,
        },
        500,
      );
    }

    const result = await res.json();
    return apiResponse({ sent: true, id: result.id });
  } catch (error) {
    return apiError(error);
  }
}

import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { sendAdminAlertEmail, isEmailConfigured } from "@/lib/email";

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

    if (!isEmailConfigured()) {
      return apiResponse({ error: "Email no configurado en el servidor" }, 500);
    }

    const sent = await sendAdminAlertEmail(recipients, alerts);

    if (!sent) {
      return apiResponse({ error: "Error al enviar la alerta" }, 500);
    }

    return apiResponse({ sent: true });
  } catch (error) {
    return apiError(error);
  }
}

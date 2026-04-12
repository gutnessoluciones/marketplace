import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { stripe } from "@/lib/stripe";

// ── Free tier limits ─────────────────────────────────────
const FREE_LIMITS = {
  supabase: {
    dbSizeMB: 500,
    storageMB: 1024,
    authUsers: 50_000,
    edgeFuncInvocations: 500_000,
    bandwidthGB: 5,
  },
  vercel: {
    bandwidthGB: 100,
    serverlessHrs: 100,
    buildMinutes: 6000,
  },
  stripe: {
    // No free tier limit, just per-transaction fees
  },
  email: {
    emailsPerDay: 10_000, // Office365 business limit
  },
  upstash: {
    commandsPerDay: 10_000,
    storageMB: 256,
  },
};

// Threshold to recommend upgrade (%)
const WARN_THRESHOLD = 70;
const CRITICAL_THRESHOLD = 90;

export async function GET() {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);
    if (auth.role !== "owner" && auth.role !== "dev") {
      return apiResponse({ error: "Forbidden" }, 403);
    }

    // ── Supabase Stats ───────────────────────────────────
    const [
      usersCount,
      productsCount,
      ordersCount,
      storageFiles,
      dbSize,
      tableStats,
    ] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("products")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
      supabaseAdmin.storage.listBuckets(),
      // DB size via RPC — if the function doesn't exist, returns null
      supabaseAdmin.rpc("get_db_size_mb").maybeSingle() as unknown as Promise<{
        data: { size_mb: number } | null;
        error: unknown;
      }>,
      // Row counts per table
      supabaseAdmin.rpc("get_table_row_counts") as unknown as Promise<{
        data: Array<{ table: string; rows: number }> | null;
        error: unknown;
      }>,
    ]);

    // Count storage files across all buckets
    let storageTotalFiles = 0;
    let storageEstimateMB = 0;
    if (storageFiles.data) {
      for (const bucket of storageFiles.data) {
        const { data: files } = await supabaseAdmin.storage
          .from(bucket.name)
          .list("", { limit: 1000 });
        if (files) {
          storageTotalFiles += files.length;
          // Estimate ~200KB per file average (images)
          storageEstimateMB += (files.length * 200) / 1024;
        }
      }
    }

    // ── Stripe Stats ─────────────────────────────────────
    let stripeData = {
      totalTransactions: 0,
      totalVolume: 0,
      last30DaysTransactions: 0,
      last30DaysVolume: 0,
      balance: 0,
    };

    try {
      const thirtyDaysAgo = Math.floor(
        (Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000,
      );

      const [balanceTxns, recentTxns, balance] = await Promise.all([
        stripe.balanceTransactions.list({ limit: 1 }),
        stripe.balanceTransactions.list({
          created: { gte: thirtyDaysAgo },
          limit: 100,
        }),
        stripe.balance.retrieve(),
      ]);

      const totalBalance =
        balance.available.reduce((s, b) => s + b.amount, 0) +
        balance.pending.reduce((s, b) => s + b.amount, 0);

      stripeData = {
        totalTransactions: balanceTxns.data.length > 0 ? -1 : 0, // -1 means "has transactions, count unknown"
        totalVolume: 0,
        last30DaysTransactions: recentTxns.data.length,
        last30DaysVolume: recentTxns.data.reduce(
          (s, t) => s + Math.abs(t.amount),
          0,
        ),
        balance: totalBalance,
      };
    } catch {
      // Stripe not configured or error — leave defaults
    }

    // ── Internal Counters (email sends, etc.) ────────────
    // We track these in site_settings if available
    const { data: counters } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", ["dev_email_counter", "dev_api_requests"]);

    const emailsSent = (counters?.find((c) => c.key === "dev_email_counter")
      ?.value as {
      monthly?: number;
      daily?: number;
      last_reset?: string;
    }) ?? { monthly: 0, daily: 0 };

    // ── Build response ───────────────────────────────────
    const supabaseStats = {
      label: "Supabase",
      plan: "Free",
      metrics: [
        {
          name: "Usuarios Auth",
          current: usersCount.count ?? 0,
          limit: FREE_LIMITS.supabase.authUsers,
          unit: "",
        },
        {
          name: "Base de datos",
          current: dbSize.data?.size_mb ?? null,
          limit: FREE_LIMITS.supabase.dbSizeMB,
          unit: "MB",
        },
        {
          name: "Almacenamiento",
          current: Math.round(storageEstimateMB),
          limit: FREE_LIMITS.supabase.storageMB,
          unit: "MB",
        },
        {
          name: "Archivos",
          current: storageTotalFiles,
          limit: null,
          unit: "archivos",
        },
      ],
      tables: tableStats.data ?? [
        { table: "profiles", rows: usersCount.count ?? 0 },
        { table: "products", rows: productsCount.count ?? 0 },
        { table: "orders", rows: ordersCount.count ?? 0 },
      ],
      dashboardUrl:
        "https://supabase.com/dashboard/project/hyolejmmvsizlceaslum",
      pricingUrl: "https://supabase.com/pricing",
    };

    const vercelStats = {
      label: "Vercel",
      plan: "Hobby",
      metrics: [
        {
          name: "Bandwidth",
          current: null,
          limit: FREE_LIMITS.vercel.bandwidthGB,
          unit: "GB",
          note: "Ver dashboard de Vercel",
        },
        {
          name: "Build Minutes",
          current: null,
          limit: FREE_LIMITS.vercel.buildMinutes,
          unit: "min",
          note: "Ver dashboard de Vercel",
        },
      ],
      dashboardUrl: "https://vercel.com/dashboard",
      pricingUrl: "https://vercel.com/pricing",
    };

    const stripeStats = {
      label: "Stripe",
      plan: "Standard",
      metrics: [
        {
          name: "Transacciones (30d)",
          current: stripeData.last30DaysTransactions,
          limit: null,
          unit: "",
        },
        {
          name: "Volumen (30d)",
          current: stripeData.last30DaysVolume,
          limit: null,
          unit: "€ (cents)",
        },
        {
          name: "Balance",
          current: stripeData.balance,
          limit: null,
          unit: "€ (cents)",
        },
      ],
      dashboardUrl: "https://dashboard.stripe.com",
      pricingUrl: "https://stripe.com/es/pricing",
    };

    const emailStats = {
      label: "Email (Office365)",
      plan: "Business",
      metrics: [
        {
          name: "Emails/día",
          current: (emailsSent as { daily?: number }).daily ?? 0,
          limit: FREE_LIMITS.email.emailsPerDay,
          unit: "",
        },
      ],
      dashboardUrl: "https://admin.microsoft.com",
      note: "SMTP: smtp.office365.com — Contador interno.",
    };

    const upstashStats = {
      label: "Upstash Redis",
      plan: hasRedis() ? "Free" : "No configurado",
      metrics: [
        {
          name: "Comandos/día",
          current: null,
          limit: FREE_LIMITS.upstash.commandsPerDay,
          unit: "",
          note: hasRedis() ? "Ver dashboard Upstash" : "Redis no configurado",
        },
        {
          name: "Storage",
          current: null,
          limit: FREE_LIMITS.upstash.storageMB,
          unit: "MB",
        },
      ],
      dashboardUrl: "https://console.upstash.com",
      pricingUrl: "https://upstash.com/pricing",
    };

    // ── Alerts ───────────────────────────────────────────
    const alerts: Array<{
      service: string;
      metric: string;
      percent: number;
      level: "ok" | "warn" | "critical";
      message: string;
    }> = [];

    const allServices = [supabaseStats, vercelStats, emailStats, upstashStats];
    for (const svc of allServices) {
      for (const m of svc.metrics) {
        if (m.current != null && m.limit != null && m.limit > 0) {
          const pct = (m.current / m.limit) * 100;
          if (pct >= CRITICAL_THRESHOLD) {
            alerts.push({
              service: svc.label,
              metric: m.name,
              percent: Math.round(pct),
              level: "critical",
              message: `${svc.label} → ${m.name}: ${Math.round(pct)}% usado. ¡Upgrade recomendado!`,
            });
          } else if (pct >= WARN_THRESHOLD) {
            alerts.push({
              service: svc.label,
              metric: m.name,
              percent: Math.round(pct),
              level: "warn",
              message: `${svc.label} → ${m.name}: ${Math.round(pct)}% usado. Vigilar.`,
            });
          }
        }
      }
    }

    return apiResponse({
      services: {
        supabase: supabaseStats,
        vercel: vercelStats,
        stripe: stripeStats,
        email: emailStats,
        upstash: upstashStats,
      },
      alerts,
      thresholds: { warn: WARN_THRESHOLD, critical: CRITICAL_THRESHOLD },
      limits: FREE_LIMITS,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return apiError(error);
  }
}

function hasRedis(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

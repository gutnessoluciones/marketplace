"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons";

interface StripeAccountInfo {
  connected: boolean;
  account?: {
    charges_enabled: boolean;
    payouts_enabled: boolean;
    country: string;
    default_currency: string;
    business_type: string;
    created: number;
    payout_schedule: {
      interval: string;
      delay_days: number;
    } | null;
  };
}

export function StripeAccountInfo() {
  const [info, setInfo] = useState<StripeAccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stripe/account-info")
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-neutral-100 rounded w-1/2" />
        <div className="h-4 bg-neutral-100 rounded w-1/3" />
      </div>
    );
  }

  if (!info?.connected || !info.account) return null;

  const { account } = info;
  const createdDate = new Date(account.created * 1000).toLocaleDateString(
    "es-ES",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const scheduleText =
    account.payout_schedule?.interval === "daily"
      ? `Diario (${account.payout_schedule.delay_days} días de retraso)`
      : account.payout_schedule?.interval === "weekly"
        ? "Semanal"
        : account.payout_schedule?.interval === "monthly"
          ? "Mensual"
          : "Automático";

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        Tu cuenta de Stripe
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-400">Cobros</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${account.charges_enabled ? "bg-emerald-500" : "bg-red-500"}`}
            />
            <p className="text-sm font-medium text-neutral-700">
              {account.charges_enabled ? "Activos" : "Inactivos"}
            </p>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-400">Transferencias</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${account.payouts_enabled ? "bg-emerald-500" : "bg-red-500"}`}
            />
            <p className="text-sm font-medium text-neutral-700">
              {account.payouts_enabled ? "Activas" : "Inactivas"}
            </p>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-400">Calendario de pagos</p>
          <p className="text-sm font-medium text-neutral-700 mt-1">
            {scheduleText}
          </p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-400">Moneda</p>
          <p className="text-sm font-medium text-neutral-700 mt-1">
            {account.default_currency?.toUpperCase() ?? "EUR"}
          </p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-400">Tipo de cuenta</p>
          <p className="text-sm font-medium text-neutral-700 mt-1">
            {account.business_type === "individual" ? "Particular" : "Empresa"}
          </p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-400">Conectada desde</p>
          <p className="text-sm font-medium text-neutral-700 mt-1">
            {createdDate}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>💡</strong> Puedes gestionar tu cuenta, ver tus cobros y
          configurar tu IBAN desde el{" "}
          <a
            href="https://connect.stripe.com/express_login"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            panel de Stripe Express
          </a>
          .
        </p>
      </div>
    </div>
  );
}

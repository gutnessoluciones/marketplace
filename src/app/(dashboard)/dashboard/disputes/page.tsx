import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DisputesService } from "@/services/disputes.service";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  open: { label: "Abierta", class: "bg-red-100 text-red-700" },
  in_review: { label: "En revisión", class: "bg-amber-100 text-amber-700" },
  resolved: { label: "Resuelta", class: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Cerrada", class: "bg-neutral-100 text-neutral-500" },
};

const REASON_MAP: Record<string, string> = {
  not_received: "No recibido",
  not_as_described: "No coincide con la descripción",
  damaged: "Artículo dañado",
  wrong_item: "Artículo incorrecto",
  other: "Otro",
};

export default async function DisputesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = new DisputesService(supabase);
  const { data: disputes } = await service.listByUser(user.id);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-flamencalia-black">
          Mis Disputas
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          {disputes.length} disputas
        </p>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center">
          <Icon
            name="checkCircle"
            className="w-10 h-10 text-emerald-300 mx-auto mb-3"
          />
          <h2 className="text-base font-semibold text-neutral-800 mb-1">
            Sin disputas
          </h2>
          <p className="text-sm text-neutral-400 max-w-xs mx-auto">
            No tienes ninguna disputa abierta. Puedes abrir una desde el detalle
            de un pedido.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute) => {
            const order = dispute.order as {
              id: string;
              total_amount: number;
              product?: { id: string; title: string; images: string[] };
            } | null;
            const st = STATUS_CONFIG[dispute.status] ?? {
              label: dispute.status,
              class: "bg-neutral-100 text-neutral-500",
            };

            return (
              <div
                key={dispute.id}
                className="bg-white border border-neutral-100 rounded-2xl p-4 sm:p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.class}`}
                      >
                        {st.label}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(dispute.created_at).toLocaleDateString(
                          "es-ES",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-800 truncate">
                      {REASON_MAP[dispute.reason] ?? dispute.reason}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                      {dispute.description}
                    </p>
                    {order && (
                      <div className="flex items-center gap-2 mt-2">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-xs font-medium text-flamencalia-albero hover:underline"
                        >
                          Ver pedido ({formatPrice(order.total_amount)})
                        </Link>
                        {order.product && (
                          <span className="text-xs text-neutral-400">
                            — {order.product.title}
                          </span>
                        )}
                      </div>
                    )}
                    {dispute.resolution && (
                      <div className="mt-2 p-2 bg-emerald-50 rounded-lg">
                        <p className="text-xs font-medium text-emerald-700">
                          Resolución: {dispute.resolution}
                        </p>
                        {dispute.admin_notes && (
                          <p className="text-xs text-emerald-600 mt-0.5">
                            {dispute.admin_notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

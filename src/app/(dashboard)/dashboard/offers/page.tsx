import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OffersService } from "@/services/offers.service";
import { Icon } from "@/components/icons";
import { OfferActions } from "@/components/offers/offer-actions";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  pending: { label: "Pendiente", class: "bg-amber-100 text-amber-700" },
  accepted: { label: "Aceptada", class: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rechazada", class: "bg-red-100 text-red-700" },
  expired: { label: "Expirada", class: "bg-neutral-100 text-neutral-500" },
  cancelled: { label: "Cancelada", class: "bg-neutral-100 text-neutral-500" },
  paid: { label: "Pagada", class: "bg-blue-100 text-blue-700" },
};

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function OffersPage({ searchParams }: PageProps) {
  const { status, page } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isSeller = profile?.role === "seller";
  const service = new OffersService(supabase);
  const currentPage = parseInt(page ?? "1");

  const result = isSeller
    ? await service.listBySeller(user.id, status ?? undefined, currentPage)
    : await service.listByBuyer(user.id, currentPage);

  const tabs = [
    { value: "", label: "Todas" },
    { value: "pending", label: "Pendientes" },
    { value: "accepted", label: "Aceptadas" },
    { value: "rejected", label: "Rechazadas" },
    { value: "expired", label: "Expiradas" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-800">
            {isSeller ? "Ofertas recibidas" : "Mis ofertas"}
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            {isSeller
              ? "Gestiona las ofertas de tus compradores"
              : "Revisa el estado de tus ofertas"}
          </p>
        </div>
      </div>

      {/* Filter tabs — seller only */}
      {isSeller && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={
                tab.value
                  ? `/dashboard/offers?status=${tab.value}`
                  : "/dashboard/offers"
              }
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                (status ?? "") === tab.value
                  ? "bg-flamencalia-black text-white"
                  : "bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-300"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}

      {result.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-flamencalia-albero-pale/30 p-12 text-center">
          <div className="w-14 h-14 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="tag" className="w-6 h-6 text-neutral-300" />
          </div>
          <p className="text-sm font-medium text-neutral-500">No hay ofertas</p>
          <p className="text-xs text-neutral-400 mt-1">
            {isSeller
              ? "Cuando recibas ofertas en tus productos aparecerán aquí"
              : "Explora productos de segunda mano y envía ofertas"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {result.data.map((offer: Record<string, unknown>) => {
            const o = offer as {
              id: string;
              amount: number;
              original_price: number;
              status: string;
              message: string | null;
              seller_response: string | null;
              expires_at: string;
              created_at: string;
              product?: {
                id: string;
                title: string;
                price: number;
                images: string[];
                status: string;
              };
              buyer?: {
                id: string;
                display_name: string;
                avatar_url: string | null;
              };
              seller?: {
                id: string;
                display_name: string;
                avatar_url: string | null;
              };
            };
            const discount = Math.round(
              (1 - o.amount / o.original_price) * 100,
            );
            const statusCfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.pending;
            const counterpart = isSeller ? o.buyer : o.seller;

            return (
              <div
                key={o.id}
                className="bg-white rounded-xl border border-flamencalia-albero-pale/30 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Product image */}
                  <Link
                    href={`/products/${o.product?.id}`}
                    className="shrink-0"
                  >
                    <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden">
                      {o.product?.images?.[0] ? (
                        <img
                          src={o.product.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon
                            name="dress"
                            className="w-6 h-6 text-neutral-300"
                          />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${o.product?.id}`}
                          className="text-sm font-semibold text-neutral-800 hover:text-flamencalia-albero line-clamp-1 transition-colors"
                        >
                          {o.product?.title ?? "Producto"}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          {counterpart && (
                            <span className="text-xs text-neutral-400">
                              {isSeller ? "De" : "A"}{" "}
                              <span className="font-medium text-neutral-500">
                                {counterpart.display_name}
                              </span>
                            </span>
                          )}
                          <span className="text-xs text-neutral-300">·</span>
                          <span className="text-xs text-neutral-400">
                            {timeAgo(o.created_at)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCfg.class}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Price row */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-base font-bold text-neutral-800">
                        {formatPrice(o.amount)}
                      </span>
                      <span className="text-xs text-neutral-400 line-through">
                        {formatPrice(o.original_price)}
                      </span>
                      <span className="text-xs font-semibold text-flamencalia-albero">
                        -{discount}%
                      </span>
                    </div>

                    {/* Message */}
                    {o.message && (
                      <p className="text-xs text-neutral-500 mt-1.5 line-clamp-1 italic">
                        &ldquo;{o.message}&rdquo;
                      </p>
                    )}
                    {o.seller_response && (
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                        <span className="font-medium">Respuesta:</span> &ldquo;
                        {o.seller_response}&rdquo;
                      </p>
                    )}

                    {/* Actions */}
                    {o.status === "pending" && (
                      <div className="mt-3">
                        {isSeller ? (
                          <OfferActions offerId={o.id} amount={o.amount} />
                        ) : (
                          <OfferActions
                            offerId={o.id}
                            amount={o.amount}
                            buyerMode
                          />
                        )}
                      </div>
                    )}

                    {/* Accepted — buyer can pay */}
                    {o.status === "accepted" && !isSeller && (
                      <div className="mt-3">
                        <OfferActions
                          offerId={o.id}
                          amount={o.amount}
                          acceptedMode
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {(result.total ?? 0) > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <Link
              href={`/dashboard/offers?page=${currentPage - 1}${status ? `&status=${status}` : ""}`}
              className="px-4 py-2 rounded-lg bg-white border border-neutral-200 text-sm hover:bg-neutral-50"
            >
              Anterior
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-neutral-500">
            Página {currentPage}
          </span>
          {(result.total ?? 0) > currentPage * 20 && (
            <Link
              href={`/dashboard/offers?page=${currentPage + 1}${status ? `&status=${status}` : ""}`}
              className="px-4 py-2 rounded-lg bg-white border border-neutral-200 text-sm hover:bg-neutral-50"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

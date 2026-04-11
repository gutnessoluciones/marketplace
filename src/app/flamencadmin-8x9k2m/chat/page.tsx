import Link from "next/link";
import Image from "next/image";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Conversaciones — Admin Flamencalia" };

export default async function AdminChatPage() {
  const auth = await isAdmin();
  if (!auth.authorized) redirect("/login");

  const { data, count } = await supabaseAdmin
    .from("conversations")
    .select(
      `*, 
      product:products(id, title, images, price),
      buyer:profiles!buyer_id(id, display_name, avatar_url),
      seller:profiles!seller_id(id, display_name, avatar_url)`,
      { count: "exact" },
    )
    .order("last_message_at", { ascending: false })
    .range(0, 49);

  const conversations = (data ?? []).map((c: Record<string, unknown>) => ({
    ...c,
    product: Array.isArray(c.product) ? c.product[0] : c.product,
    buyer: Array.isArray(c.buyer) ? c.buyer[0] : c.buyer,
    seller: Array.isArray(c.seller) ? c.seller[0] : c.seller,
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-flamencalia-black">
            Conversaciones
          </h1>
          <p className="text-sm text-flamencalia-black/40 mt-1">
            {count ?? 0} conversaciones en total
          </p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 bg-flamencalia-cream/30 rounded-2xl border border-dashed border-flamencalia-albero-pale/50">
          <svg
            className="w-12 h-12 text-flamencalia-albero/40 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
          <p className="text-flamencalia-black/40 text-sm">
            No hay conversaciones todavía
          </p>
        </div>
      ) : (
        <div className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/20 overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-5 py-3 bg-flamencalia-cream/50 border-b border-flamencalia-albero-pale/15 text-xs font-semibold text-flamencalia-black/50 uppercase tracking-wider">
            <div className="col-span-4">Participantes</div>
            <div className="col-span-3">Producto</div>
            <div className="col-span-3">Última actividad</div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-flamencalia-albero-pale/10">
            {conversations.map((conv: Record<string, unknown>) => {
              const buyer = conv.buyer as Record<string, string> | null;
              const seller = conv.seller as Record<string, string> | null;
              const product = conv.product as Record<string, unknown> | null;
              const images = product?.images as string[] | undefined;

              return (
                <Link
                  key={conv.id as string}
                  href={`/admin/chat/${conv.id}`}
                  className="block sm:grid sm:grid-cols-12 gap-4 px-5 py-4 hover:bg-flamencalia-cream/30 transition-colors group"
                >
                  {/* Participants */}
                  <div className="col-span-4 flex items-center gap-3 mb-2 sm:mb-0">
                    <div className="flex -space-x-2">
                      <Avatar
                        url={buyer?.avatar_url}
                        name={buyer?.display_name}
                        className="ring-2 ring-flamencalia-white"
                      />
                      <Avatar
                        url={seller?.avatar_url}
                        name={seller?.display_name}
                        className="ring-2 ring-flamencalia-white"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-flamencalia-black truncate group-hover:text-flamencalia-red transition-colors">
                        {buyer?.display_name || "Comprador"}
                      </p>
                      <p className="text-xs text-flamencalia-black/35 truncate">
                        con {seller?.display_name || "Vendedor"}
                      </p>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="col-span-3 flex items-center gap-2.5 mb-2 sm:mb-0">
                    {images?.[0] && (
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-flamencalia-cream ring-1 ring-flamencalia-albero-pale/15">
                        <img
                          src={images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-flamencalia-black/70 truncate">
                        {(product?.title as string) || "—"}
                      </p>
                      {product?.price && (
                        <p className="text-xs text-flamencalia-albero font-medium">
                          {formatPrice(product.price as number)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-3 flex items-center text-xs text-flamencalia-black/40">
                    {new Date(
                      conv.last_message_at as string,
                    ).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {/* Action */}
                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-xs font-medium text-flamencalia-red/60 group-hover:text-flamencalia-red transition-colors flex items-center gap-1">
                      Ver chat
                      <svg
                        className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({
  url,
  name,
  className = "",
}: {
  url?: string | null;
  name?: string | null;
  className?: string;
}) {
  return (
    <div
      className={`w-8 h-8 rounded-full bg-flamencalia-albero-pale/30 overflow-hidden shrink-0 ${className}`}
    >
      {url ? (
        <Image
          src={url}
          alt={name || ""}
          width={32}
          height={32}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-flamencalia-albero">
          {(name || "?").charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

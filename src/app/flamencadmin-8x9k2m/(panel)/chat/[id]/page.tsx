import Image from "next/image";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Ver conversación — Admin Flamencalia" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminChatDetailPage({ params }: PageProps) {
  const { id } = await params;
  const auth = await isAdmin();
  if (!auth.authorized) redirect("/login");

  // Get conversation
  const { data: rawConv, error: convError } = await supabaseAdmin
    .from("conversations")
    .select(
      `*, 
      product:products(id, title, images, price, status),
      buyer:profiles!buyer_id(id, display_name, avatar_url),
      seller:profiles!seller_id(id, display_name, avatar_url)`,
    )
    .eq("id", id)
    .single();

  if (convError || !rawConv) redirect("/flamencadmin-8x9k2m/chat");

  const conversation = {
    ...rawConv,
    product: Array.isArray(rawConv.product)
      ? rawConv.product[0]
      : rawConv.product,
    buyer: Array.isArray(rawConv.buyer) ? rawConv.buyer[0] : rawConv.buyer,
    seller: Array.isArray(rawConv.seller) ? rawConv.seller[0] : rawConv.seller,
  };

  // Get all messages
  const { data: messages } = await supabaseAdmin
    .from("messages")
    .select("*, sender:profiles!sender_id(id, display_name, avatar_url)")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const product = conversation.product as Record<string, unknown> | null;
  const buyer = conversation.buyer as Record<string, string> | null;
  const seller = conversation.seller as Record<string, string> | null;
  const images = product?.images as string[] | undefined;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/flamencadmin-8x9k2m/chat"
          className="w-9 h-9 rounded-xl bg-flamencalia-cream hover:bg-flamencalia-albero-pale/30 flex items-center justify-center transition-colors"
        >
          <svg
            className="w-4 h-4 text-flamencalia-black/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-flamencalia-black">
            Conversación
          </h1>
          <p className="text-xs text-flamencalia-black/40">
            Solo lectura — Vista de administrador
          </p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/20 p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Product */}
          <div className="flex items-center gap-3 flex-1">
            {images?.[0] && (
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-flamencalia-cream ring-1 ring-flamencalia-albero-pale/15">
                <img
                  src={images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-flamencalia-black">
                {(product?.title as string) || "Producto eliminado"}
              </p>
              {product?.price && (
                <p className="text-sm text-flamencalia-albero font-medium">
                  {formatPrice(product.price as number)}
                </p>
              )}
              {product?.status && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                    product.status === "active"
                      ? "bg-green-50 text-green-600"
                      : product.status === "sold"
                        ? "bg-flamencalia-albero-pale/30 text-flamencalia-albero"
                        : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {product.status === "active"
                    ? "Activo"
                    : product.status === "sold"
                      ? "Vendido"
                      : (product.status as string)}
                </span>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <ParticipantAvatar
                url={buyer?.avatar_url}
                name={buyer?.display_name}
              />
              <div>
                <p className="text-xs text-flamencalia-black/40">Comprador</p>
                <p className="font-medium text-flamencalia-black text-sm">
                  {buyer?.display_name || "—"}
                </p>
              </div>
            </div>
            <svg
              className="w-4 h-4 text-flamencalia-albero-pale"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
            <div className="flex items-center gap-2">
              <ParticipantAvatar
                url={seller?.avatar_url}
                name={seller?.display_name}
              />
              <div>
                <p className="text-xs text-flamencalia-black/40">Vendedor</p>
                <p className="font-medium text-flamencalia-black text-sm">
                  {seller?.display_name || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin read-only badge */}
      <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200/50 rounded-xl text-xs text-amber-700">
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        Vista de solo lectura — {(messages ?? []).length} mensajes en esta
        conversación
      </div>

      {/* Messages */}
      <div className="space-y-3 mb-8">
        {(messages ?? []).length === 0 ? (
          <div className="text-center py-12 text-flamencalia-black/30 text-sm bg-flamencalia-cream/30 rounded-2xl border border-dashed border-flamencalia-albero-pale/40">
            No hay mensajes en esta conversación
          </div>
        ) : (
          (messages ?? []).map(
            (msg: {
              id: string;
              content: string;
              sender_id: string;
              created_at: string;
              sender: Record<string, string> | Record<string, string>[];
            }) => {
              const sender = Array.isArray(msg.sender)
                ? msg.sender[0]
                : msg.sender;
              const isBuyer = msg.sender_id === (buyer?.id ?? "");

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isBuyer ? "justify-start" : "justify-end"}`}
                >
                  {isBuyer && (
                    <ParticipantAvatar
                      url={sender?.avatar_url}
                      name={sender?.display_name}
                      size="sm"
                    />
                  )}

                  <div className="max-w-sm lg:max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium text-flamencalia-black/40">
                        {sender?.display_name || "Usuario"}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                          isBuyer
                            ? "bg-blue-50 text-blue-500"
                            : "bg-flamencalia-albero-pale/30 text-flamencalia-albero"
                        }`}
                      >
                        {isBuyer ? "Comprador" : "Vendedor"}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2.5 text-sm leading-relaxed rounded-2xl ${
                        isBuyer
                          ? "bg-flamencalia-white border border-flamencalia-albero-pale/15 rounded-bl-md"
                          : "bg-flamencalia-red/5 border border-flamencalia-red/10 rounded-br-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap wrap-break-word text-flamencalia-black">
                        {msg.content}
                      </p>
                    </div>
                    <p className="text-[10px] text-flamencalia-black/25 mt-1 px-1">
                      {new Date(msg.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {!isBuyer && (
                    <ParticipantAvatar
                      url={sender?.avatar_url}
                      name={sender?.display_name}
                      size="sm"
                    />
                  )}
                </div>
              );
            },
          )
        )}
      </div>
    </div>
  );
}

function ParticipantAvatar({
  url,
  name,
  size = "md",
}: {
  url?: string | null;
  name?: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const imgSize = size === "sm" ? 28 : 36;
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div
      className={`${dim} rounded-full bg-flamencalia-albero-pale/25 overflow-hidden shrink-0`}
    >
      {url ? (
        <Image
          src={url}
          alt={name || ""}
          width={imgSize}
          height={imgSize}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${textSize} font-bold text-flamencalia-albero`}
        >
          {(name || "?").charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ChatService } from "@/services/chat.service";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Mis Mensajes — Flamencalia" };

export default async function ChatListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = new ChatService(supabase);
  const conversations = await service.listConversations(user.id);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-flamencalia-red/10 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-flamencalia-red"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-flamencalia-black">
            Mis Mensajes
          </h1>
          <p className="text-xs text-flamencalia-black/40">
            {conversations.length}{" "}
            {conversations.length === 1 ? "conversación" : "conversaciones"}
          </p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 bg-flamencalia-cream/30 rounded-2xl border border-dashed border-flamencalia-albero-pale/50">
          <div className="w-20 h-20 bg-flamencalia-albero-pale/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-10 h-10 text-flamencalia-albero/60"
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
          </div>
          <p className="text-flamencalia-black/60 text-sm font-medium mb-1">
            No tienes conversaciones aún
          </p>
          <p className="text-flamencalia-black/30 text-xs max-w-xs mx-auto">
            Envía un mensaje a un vendedor desde la página del producto para
            iniciar una conversación
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = user.id === conv.buyer_id ? conv.seller : conv.buyer;
            const otherProfile = Array.isArray(other) ? other[0] : other;
            const product = Array.isArray(conv.product)
              ? conv.product[0]
              : conv.product;

            return (
              <Link
                key={conv.id}
                href={`/dashboard/chat/${conv.id}`}
                className="group flex items-center gap-3.5 p-4 bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/20 hover:border-flamencalia-albero/40 hover:shadow-md hover:shadow-flamencalia-albero/5 transition-all duration-200"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-flamencalia-albero-pale/40 to-flamencalia-albero-pale/20 overflow-hidden shrink-0 ring-2 ring-flamencalia-albero-pale/20 group-hover:ring-flamencalia-albero/30 transition-all">
                    {otherProfile?.avatar_url ? (
                      <Image
                        src={otherProfile.avatar_url}
                        alt={otherProfile.display_name || ""}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-flamencalia-albero">
                        {(otherProfile?.display_name || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-flamencalia-black truncate group-hover:text-flamencalia-red transition-colors">
                      {otherProfile?.display_name || "Usuario"}
                    </span>
                    <span className="text-[10px] text-flamencalia-black/30 shrink-0 bg-flamencalia-cream/50 px-2 py-0.5 rounded-full">
                      {new Date(conv.last_message_at).toLocaleDateString(
                        "es-ES",
                        { day: "numeric", month: "short" },
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-flamencalia-black/45 truncate">
                    {product?.title || "Producto"}
                    {product?.price ? ` · ${formatPrice(product.price)}` : ""}
                  </p>
                </div>

                {/* Product thumbnail */}
                {product?.images?.[0] && (
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-flamencalia-cream ring-1 ring-flamencalia-albero-pale/20">
                    <img
                      src={product.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Arrow */}
                <svg
                  className="w-4 h-4 text-flamencalia-black/15 group-hover:text-flamencalia-albero group-hover:translate-x-0.5 transition-all shrink-0"
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

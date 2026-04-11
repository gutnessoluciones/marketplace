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
    <div>
      <h1 className="text-xl font-bold text-flamencalia-black mb-6">
        Mis Mensajes
      </h1>

      {conversations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-flamencalia-albero-pale/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-flamencalia-albero"
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
          <p className="text-flamencalia-black/50 text-sm">
            No tienes conversaciones aún
          </p>
          <p className="text-flamencalia-black/30 text-xs mt-1">
            Envía un mensaje a un vendedor desde la página del producto
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
                className="flex items-center gap-3 p-4 bg-flamencalia-white rounded-xl border border-flamencalia-albero-pale/30 hover:border-flamencalia-albero/50 transition-all"
              >
                {/* Other person avatar */}
                <div className="w-11 h-11 rounded-full bg-flamencalia-albero-pale/30 overflow-hidden shrink-0">
                  {otherProfile?.avatar_url ? (
                    <Image
                      src={otherProfile.avatar_url}
                      alt={otherProfile.display_name || ""}
                      width={44}
                      height={44}
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

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-flamencalia-black truncate">
                      {otherProfile?.display_name || "Usuario"}
                    </span>
                    <span className="text-[10px] text-flamencalia-black/30 shrink-0">
                      {new Date(conv.last_message_at).toLocaleDateString(
                        "es-ES",
                        { day: "numeric", month: "short" },
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-flamencalia-black/50 truncate">
                    {product?.title || "Producto"}
                    {product?.price ? ` · ${formatPrice(product.price)}` : ""}
                  </p>
                </div>

                {/* Product thumb */}
                {product?.images?.[0] && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-flamencalia-cream">
                    <img
                      src={product.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

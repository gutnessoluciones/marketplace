"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { AdminToast } from "@/components/admin/toast";

interface Participant {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender: Participant | Participant[];
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product: {
    id: string;
    title: string;
    images: string[];
    price: number;
    status: string;
  } | null;
  buyer: Participant | null;
  seller: Participant | null;
}

export default function AdminChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [convId, setConvId] = useState<string>("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((p) => setConvId(p.id));
  }, [params]);

  const loadChat = useCallback(async () => {
    if (!convId) return;
    const res = await fetch(`/api/admin/chat/${convId}`);
    if (!res.ok) return;
    const json = await res.json();
    setConversation(json.conversation ?? null);
    setMessages(json.messages ?? []);
    setLoading(false);
  }, [convId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/admin/chat/${convId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage.trim() }),
    });
    if (res.ok) {
      setNewMessage("");
      setToast({ msg: "Mensaje enviado", type: "success" });
      await loadChat();
    } else {
      setToast({ msg: "Error al enviar el mensaje", type: "error" });
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-sm text-neutral-400">
        Cargando conversación…
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-sm text-neutral-400">
        Conversación no encontrada
      </div>
    );
  }

  const product = conversation.product;
  const buyer = conversation.buyer;
  const seller = conversation.seller;
  const images = product?.images;
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);

  return (
    <div
      className="max-w-3xl mx-auto flex flex-col"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-4">
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
            Puedes intervenir como Administrador
          </p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/20 p-4 mb-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            {images?.[0] && (
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-flamencalia-cream ring-1 ring-flamencalia-albero-pale/15">
                <img
                  src={images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-flamencalia-black">
                {product?.title || "Producto eliminado"}
              </p>
              {product?.price != null && (
                <p className="text-sm text-flamencalia-albero font-medium">
                  {formatPrice(product.price)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-2">
              <Avatar url={buyer?.avatar_url} name={buyer?.display_name} />
              <div>
                <p className="text-[10px] text-flamencalia-black/40">
                  Comprador
                </p>
                <p className="font-medium text-flamencalia-black text-xs">
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
              <Avatar url={seller?.avatar_url} name={seller?.display_name} />
              <div>
                <p className="text-[10px] text-flamencalia-black/40">
                  Vendedor
                </p>
                <p className="font-medium text-flamencalia-black text-xs">
                  {seller?.display_name || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-flamencalia-black/30 text-sm bg-flamencalia-cream/30 rounded-2xl border border-dashed border-flamencalia-albero-pale/40">
            No hay mensajes en esta conversación
          </div>
        ) : (
          messages.map((msg) => {
            const sender = Array.isArray(msg.sender)
              ? msg.sender[0]
              : msg.sender;
            const isBuyer = msg.sender_id === (buyer?.id ?? "");
            const isSeller = msg.sender_id === (seller?.id ?? "");
            const isAdmin = !isBuyer && !isSeller;

            const alignment = isAdmin
              ? "justify-center"
              : isBuyer
                ? "justify-start"
                : "justify-end";
            const bubbleClass = isAdmin
              ? "bg-flamencalia-albero/10 border border-flamencalia-albero/20 rounded-xl"
              : isBuyer
                ? "bg-flamencalia-white border border-flamencalia-albero-pale/15 rounded-bl-md rounded-2xl"
                : "bg-flamencalia-red/5 border border-flamencalia-red/10 rounded-br-md rounded-2xl";
            const badgeClass = isAdmin
              ? "bg-flamencalia-albero/20 text-flamencalia-albero-dark"
              : isBuyer
                ? "bg-blue-50 text-blue-500"
                : "bg-flamencalia-albero-pale/30 text-flamencalia-albero";
            const badgeLabel = isAdmin
              ? "Admin"
              : isBuyer
                ? "Comprador"
                : "Vendedor";

            return (
              <div key={msg.id} className={`flex gap-2.5 ${alignment}`}>
                {(isBuyer || isAdmin) && (
                  <Avatar
                    url={isAdmin ? null : sender?.avatar_url}
                    name={isAdmin ? "A" : sender?.display_name}
                    size="sm"
                    isAdmin={isAdmin}
                  />
                )}
                <div className="max-w-sm lg:max-w-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium text-flamencalia-black/40">
                      {isAdmin
                        ? "Administrador"
                        : sender?.display_name || "Usuario"}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${badgeClass}`}
                    >
                      {badgeLabel}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed ${bubbleClass}`}
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
                {isSeller && (
                  <Avatar
                    url={sender?.avatar_url}
                    name={sender?.display_name}
                    size="sm"
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <div className="shrink-0 pt-3 border-t border-flamencalia-albero-pale/15 mt-2">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-flamencalia-albero/20 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-flamencalia-albero"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <span className="text-[10px] font-medium text-flamencalia-albero">
            Enviando como Administrador
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Escribe un mensaje como Administrador..."
            className="flex-1 text-sm border border-neutral-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-flamencalia-albero hover:bg-flamencalia-albero/90 disabled:opacity-40 transition-colors"
          >
            {sending ? "…" : "Enviar"}
          </button>
        </div>
      </div>
      {toast && (
        <AdminToast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function Avatar({
  url,
  name,
  size = "md",
  isAdmin = false,
}: {
  url?: string | null;
  name?: string | null;
  size?: "sm" | "md";
  isAdmin?: boolean;
}) {
  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const imgSize = size === "sm" ? 28 : 36;
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  if (isAdmin) {
    return (
      <div
        className={`${dim} rounded-full bg-flamencalia-albero/20 flex items-center justify-center shrink-0`}
      >
        <svg
          className="w-3.5 h-3.5 text-flamencalia-albero"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      </div>
    );
  }

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

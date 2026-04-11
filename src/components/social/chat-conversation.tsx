"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
  sender: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface Conversation {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  product: {
    id: string;
    title: string;
    images: string[];
    price: number;
    status: string;
  };
  buyer: { id: string; display_name: string | null; avatar_url: string | null };
  seller: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function ChatConversation({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterError, setFilterError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${conversationId}`);
      const data = await res.json();
      if (data.conversation) {
        setConversation((prev) => {
          const c = data.conversation;
          const conv = {
            ...c,
            product: Array.isArray(c.product) ? c.product[0] : c.product,
            buyer: Array.isArray(c.buyer) ? c.buyer[0] : c.buyer,
            seller: Array.isArray(c.seller) ? c.seller[0] : c.seller,
          };
          return conv;
        });
      }
      if (data.messages?.data) {
        setMessages(data.messages.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    // Poll every 5 seconds
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || sending) return;

    setSending(true);
    setNewMessage("");
    setFilterError(null);

    try {
      const res = await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFilterError(data.error || "Error al enviar el mensaje");
        setNewMessage(content);
        return;
      }
      if (data.id) {
        setMessages((prev) => [...prev, data]);
      }
    } catch {
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-flamencalia-albero border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-16 text-flamencalia-black/40 text-sm">
        Conversación no encontrada
      </div>
    );
  }

  const other =
    userId === conversation.buyer_id ? conversation.seller : conversation.buyer;
  const product = conversation.product;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-flamencalia-albero-pale/30 shrink-0">
        <Link
          href="/dashboard/chat"
          className="w-8 h-8 rounded-full bg-flamencalia-albero-pale/20 flex items-center justify-center hover:bg-flamencalia-albero-pale/40 transition-colors"
        >
          <svg
            className="w-4 h-4 text-flamencalia-black"
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

        <div className="w-10 h-10 rounded-full bg-flamencalia-albero-pale/30 overflow-hidden shrink-0">
          {other?.avatar_url ? (
            <Image
              src={other.avatar_url}
              alt={other.display_name || ""}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-flamencalia-albero">
              {(other?.display_name || "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-flamencalia-black truncate">
            {other?.display_name || "Usuario"}
          </p>
          {product && (
            <Link
              href={`/products/${product.id}`}
              className="text-xs text-flamencalia-black/40 hover:text-flamencalia-albero transition-colors truncate block"
            >
              {product.title} · {formatPrice(product.price)}
            </Link>
          )}
        </div>

        {product?.images?.[0] && (
          <Link
            href={`/products/${product.id}`}
            className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-flamencalia-cream"
          >
            <img
              src={product.images[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-12 text-flamencalia-black/30 text-sm">
            Envía el primer mensaje
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === userId;
          const sender = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
          return (
            <div
              key={msg.id}
              className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
            >
              {!isOwn && (
                <div className="w-7 h-7 rounded-full bg-flamencalia-albero-pale/30 overflow-hidden shrink-0 mt-1">
                  {sender?.avatar_url ? (
                    <img
                      src={sender.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-flamencalia-albero">
                      {(sender?.display_name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              <div
                className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isOwn
                    ? "bg-flamencalia-black text-white rounded-br-md"
                    : "bg-flamencalia-albero-pale/20 text-flamencalia-black rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap wrap-break-word">
                  {msg.content}
                </p>
                <p
                  className={`text-[10px] mt-1 ${isOwn ? "text-white/40" : "text-flamencalia-black/30"}`}
                >
                  {new Date(msg.created_at).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {filterError && (
        <div className="shrink-0 mx-1 mt-2 px-4 py-2.5 bg-flamencalia-red/10 border border-flamencalia-red/20 rounded-xl text-xs text-flamencalia-red leading-relaxed flex items-start gap-2">
          <svg
            className="w-4 h-4 shrink-0 mt-0.5"
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
          <span>{filterError}</span>
        </div>
      )}
      <form
        onSubmit={handleSend}
        className="shrink-0 pt-4 border-t border-flamencalia-albero-pale/30"
      >
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-flamencalia-albero-pale/10 rounded-2xl border border-flamencalia-albero-pale/30 focus-within:border-flamencalia-albero/50 transition-colors">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full bg-transparent px-4 py-3 text-sm text-flamencalia-black placeholder:text-flamencalia-black/30 resize-none focus:outline-none max-h-24"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-full bg-flamencalia-black text-white flex items-center justify-center hover:bg-flamencalia-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

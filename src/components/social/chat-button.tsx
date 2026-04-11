"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChatButtonProps {
  productId: string;
  sellerId: string;
}

export function ChatButton({ productId, sellerId }: ChatButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChat() {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, seller_id: sellerId }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      router.push(`/dashboard/chat/${data.conversation_id}`);
    } catch {
      alert("Error al iniciar el chat");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleChat}
      disabled={loading}
      className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl border-2 border-flamencalia-black text-flamencalia-black hover:bg-flamencalia-black hover:text-white transition-all disabled:opacity-50"
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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      {loading ? "Abriendo chat..." : "Enviar mensaje"}
    </button>
  );
}

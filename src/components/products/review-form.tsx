"use client";

import { useState } from "react";

interface ReviewFormProps {
  orderId: string;
  onSubmitted?: () => void;
}

export function ReviewForm({ orderId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Selecciona una puntuación");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(
          data.error?.message ||
            data.error?.toString() ||
            "Error al enviar reseña",
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
      onSubmitted?.();
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <p className="text-sm font-medium text-emerald-700">
          ¡Gracias por tu reseña!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Puntuación
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="text-2xl transition-colors"
            >
              <span
                className={
                  star <= (hover || rating)
                    ? "text-amber-400"
                    : "text-slate-200"
                }
              >
                ★
              </span>
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-slate-500 ml-2 self-center">
              {rating === 1
                ? "Malo"
                : rating === 2
                  ? "Regular"
                  : rating === 3
                    ? "Bueno"
                    : rating === 4
                      ? "Muy bueno"
                      : "Excelente"}
            </span>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Comentario (opcional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Cuéntanos tu experiencia con este producto..."
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-slate-50/50 resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full bg-linear-to-r from-indigo-600 to-violet-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all"
      >
        {loading ? "Enviando..." : "Enviar Reseña"}
      </button>
    </form>
  );
}

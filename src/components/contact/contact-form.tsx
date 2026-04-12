"use client";

import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-flamencalia-black">
          ¡Mensaje enviado!
        </h3>
        <p className="mt-2 text-sm text-flamencalia-black/60">
          Te responderemos lo antes posible. Gracias por contactar con
          Flamencalia.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1.5 block text-sm font-medium text-flamencalia-black"
          >
            Nombre
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-flamencalia-albero focus:ring-2 focus:ring-flamencalia-albero/20"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="mb-1.5 block text-sm font-medium text-flamencalia-black"
          >
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-flamencalia-albero focus:ring-2 focus:ring-flamencalia-albero/20"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="mb-1.5 block text-sm font-medium text-flamencalia-black"
        >
          Asunto
        </label>
        <select
          id="contact-subject"
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-flamencalia-albero focus:ring-2 focus:ring-flamencalia-albero/20"
        >
          <option value="">Selecciona un asunto</option>
          <option value="compra">Problema con una compra</option>
          <option value="venta">Problema con una venta</option>
          <option value="cuenta">Mi cuenta</option>
          <option value="pagos">Pagos y facturación</option>
          <option value="sugerencia">Sugerencia</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-sm font-medium text-flamencalia-black"
        >
          Mensaje
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          minLength={10}
          maxLength={2000}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-flamencalia-albero focus:ring-2 focus:ring-flamencalia-albero/20"
          placeholder="Describe tu consulta..."
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">
          Error al enviar el mensaje. Por favor, inténtalo de nuevo.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-flamencalia-albero px-6 py-3 text-sm font-semibold text-white transition hover:bg-flamencalia-albero/90 disabled:opacity-50"
      >
        {status === "sending" ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}

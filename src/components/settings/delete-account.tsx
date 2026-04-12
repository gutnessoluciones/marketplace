"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export function DeleteAccountSection() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "deleting">("idle");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (confirmText !== "ELIMINAR") return;
    setStep("deleting");
    setError(null);

    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.deleted) {
        router.push("/?account_deleted=true");
      } else {
        setError(data.error || "Error eliminando la cuenta");
        setStep("confirm");
      }
    } catch {
      setError("Error de conexión");
      setStep("confirm");
    }
  }

  if (step === "idle") {
    return (
      <div className="p-6">
        <p className="text-sm text-neutral-500 mb-4">
          Si eliminas tu cuenta, se borrarán tus datos personales, direcciones y
          favoritos. Tus productos se archivarán y los pedidos se mantendrán
          anonimizados por obligación legal.
        </p>
        <button
          onClick={() => setStep("confirm")}
          className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
        >
          Eliminar mi cuenta
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <Icon
            name="alertTriangle"
            className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm font-semibold text-red-700">¿Estás seguro?</p>
            <p className="text-xs text-red-600 mt-1">
              Esta acción es irreversible. Se eliminarán todos tus datos
              personales y se cerrará tu sesión permanentemente.
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-neutral-600 mb-2">
        Escribe <strong>ELIMINAR</strong> para confirmar:
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="ELIMINAR"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 mb-3"
        disabled={step === "deleting"}
      />

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={confirmText !== "ELIMINAR" || step === "deleting"}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {step === "deleting" ? "Eliminando…" : "Confirmar eliminación"}
        </button>
        <button
          onClick={() => {
            setStep("idle");
            setConfirmText("");
            setError(null);
          }}
          disabled={step === "deleting"}
          className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

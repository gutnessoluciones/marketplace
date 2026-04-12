"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-flamencalia-cream px-4 text-center">
      <div className="mb-6 text-8xl font-bold text-red-200 font-serif">500</div>
      <h1 className="font-serif text-2xl font-bold text-flamencalia-black md:text-3xl">
        Algo ha ido mal
      </h1>
      <p className="mt-3 max-w-md text-flamencalia-black/60">
        Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
        Puedes intentarlo de nuevo o volver al inicio.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-flamencalia-albero px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-flamencalia-albero/90"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="rounded-lg border border-flamencalia-albero/30 px-6 py-2.5 text-sm font-semibold text-flamencalia-black transition hover:bg-white"
        >
          Ir al inicio
        </Link>
      </div>
      <p className="mt-12 text-xs text-flamencalia-black/30">
        FLAMENCALIA · &ldquo;Larga vida a tu Flamenca&rdquo;
      </p>
    </div>
  );
}

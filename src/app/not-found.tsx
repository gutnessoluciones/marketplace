import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-flamencalia-cream px-4 text-center">
      <div className="mb-6 text-8xl font-bold text-flamencalia-albero/30 font-serif">
        404
      </div>
      <h1 className="font-serif text-2xl font-bold text-flamencalia-black md:text-3xl">
        Página no encontrada
      </h1>
      <p className="mt-3 max-w-md text-flamencalia-black/60">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-flamencalia-albero px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-flamencalia-albero/90"
        >
          Ir al inicio
        </Link>
        <Link
          href="/products"
          className="rounded-lg border border-flamencalia-albero/30 px-6 py-2.5 text-sm font-semibold text-flamencalia-black transition hover:bg-white"
        >
          Ver productos
        </Link>
      </div>
      <p className="mt-12 text-xs text-flamencalia-black/30">
        FLAMENCALIA · &ldquo;Larga vida a tu Flamenca&rdquo;
      </p>
    </div>
  );
}

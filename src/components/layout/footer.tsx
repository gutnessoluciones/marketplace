import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  { slug: "feria", label: "Feria" },
  { slug: "camino", label: "Camino" },
  { slug: "complementos-flamencos", label: "Complementos Flamencos" },
  { slug: "invitada-flamenca", label: "Invitada Flamenca" },
  { slug: "moda-infantil", label: "Moda Infantil" },
  { slug: "equitacion", label: "Equitación" },
  { slug: "zapatos", label: "Zapatos" },
];

export function Footer() {
  return (
    <footer className="bg-flamencalia-black text-white relative overflow-hidden">
      {/* Toldo decorativo superior */}
      <div className="h-3 toldo-rayas" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/cliente/flamencalia.jpg"
                alt="Flamencalia"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div>
                <span className="font-serif font-bold text-lg tracking-wide">
                  FLAMENCALIA
                </span>
                <p className="text-xs text-flamencalia-albero-light italic">
                  &ldquo;Larga vida a tu Flamenca&rdquo;
                </p>
              </div>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Tu marketplace de moda flamenca. Vestidos, mantones, complementos
              y más. Compra a diseñadores y a la comunidad.
            </p>
            <a
              href="mailto:info@flamencalia.com"
              className="inline-flex items-center gap-2 mt-3 text-sm text-flamencalia-albero hover:text-flamencalia-albero-light transition-colors"
            >
              ✉ info@flamencalia.com
            </a>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-flamencalia-albero mb-3">
              Categorías
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tu cuenta */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-flamencalia-albero mb-3">
              Tu cuenta
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Mi Panel
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/orders"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/products"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Mis Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/settings"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Configuración
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-flamencalia-albero mb-3">
              Información
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/ferias"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Calendario de Ferias
                </Link>
              </li>
              <li>
                <Link
                  href="/lookbook"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Inspírate
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="text-sm text-neutral-400 hover:text-flamencalia-albero-light transition-colors"
                >
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Flamencalia. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span>
              Hecho con ❤️ por{" "}
              <a
                href="https://www.gutnes.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-flamencalia-albero hover:text-flamencalia-albero-light transition-colors"
              >
                Gutnes
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

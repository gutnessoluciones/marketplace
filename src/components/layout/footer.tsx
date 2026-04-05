import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-indigo-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Image
                src="/gutnes-logo.png"
                alt="GutnesPlace"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-lg">GutnesPlace</span>
            </Link>
            <p className="text-sm text-indigo-300 leading-relaxed">
              Tu marketplace de productos únicos de vendedores independientes.
            </p>
            <a
              href="https://gutnes.es"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs text-indigo-400 hover:text-white transition-colors"
            >
              Un proyecto de gutnes.es
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
              Explorar
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-indigo-200 hover:text-white transition-colors"
                >
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=electronica"
                  className="text-sm text-indigo-200 hover:text-white transition-colors"
                >
                  Electrónica
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=ropa"
                  className="text-sm text-indigo-200 hover:text-white transition-colors"
                >
                  Moda
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=hogar"
                  className="text-sm text-indigo-200 hover:text-white transition-colors"
                >
                  Hogar
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
              Tu cuenta
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-indigo-200 hover:text-white transition-colors"
                >
                  Panel de control
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/orders"
                  className="text-sm text-indigo-200 hover:text-white transition-colors"
                >
                  Mis pedidos
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/settings"
                  className="text-sm text-indigo-200 hover:text-white transition-colors"
                >
                  Configuración
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-indigo-200 hover:text-white transition-colors"
                >
                  Registrarse como vendedor
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-indigo-200 hover:text-white transition-colors"
                >
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-indigo-200 hover:text-white transition-colors"
                >
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="text-sm text-indigo-200 hover:text-white transition-colors"
                >
                  Política de cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-indigo-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-indigo-400">
            © {new Date().getFullYear()} GutnesPlace. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://gutnes.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-white transition-colors"
            >
              gutnes.es
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

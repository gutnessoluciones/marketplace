import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            🛍️ Marketplace
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Explorar
            </Link>
            <Link
              href="/login"
              className="text-sm bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-3xl mx-auto text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-emerald-200">
            ✨ Tu mercado de confianza
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight">
            Compra y Vende
            <span className="block bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Productos Únicos
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Un marketplace creado para vendedores independientes. Descubre
            productos únicos y apoya a pequeños negocios.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
            >
              Explorar Productos
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto border-2 border-gray-200 px-8 py-3.5 rounded-lg text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Empezar a Vender
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span> Pagos seguros
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🚀</span> Envío rápido
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span> Vendedores verificados
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          &copy; 2026 Marketplace. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

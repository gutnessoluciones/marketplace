import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Marketplace
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-sm hover:underline">
              Browse
            </Link>
            <Link
              href="/login"
              className="text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Buy &amp; Sell
            <span className="block text-gray-500">From Real People</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            A marketplace built for independent sellers. Discover unique
            products, support small businesses.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/products"
              className="bg-black text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-800"
            >
              Browse Products
            </Link>
            <Link
              href="/register"
              className="border px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-50"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; 2026 Marketplace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

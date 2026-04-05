import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-950 to-violet-900 items-center justify-center relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
        <div className="relative text-center px-12">
          <Image
            src="/gutnes-logo.png"
            alt="GutnesPlace"
            width={64}
            height={64}
            className="rounded-2xl mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-white mb-3">GutnesPlace</h2>
          <p className="text-indigo-200/70 max-w-sm">
            Tu plataforma para comprar y vender productos únicos de vendedores
            independientes.
          </p>
        </div>
      </div>
      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="lg:hidden flex items-center justify-center gap-2 text-xl font-bold tracking-tight mb-8"
          >
            <Image
              src="/gutnes-logo.png"
              alt="GutnesPlace"
              width={32}
              height={32}
              className="rounded-lg"
            />
            GutnesPlace
          </Link>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            {children}
          </div>
          <p className="text-xs text-slate-400 text-center mt-6">
            &copy; 2026 GutnesPlace by{" "}
            <a
              href="https://www.gutnes.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              Gutnes Digital
            </a>
            . Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

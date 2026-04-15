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
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-flamencalia-red via-flamencalia-red-dark to-flamencalia-black items-center justify-center relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-flamencalia-albero/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-flamencalia-red-light/10 rounded-full blur-3xl" />

        {/* Farolillos */}
        <div className="absolute top-8 left-[20%] farolillo opacity-30">
          <div className="w-5 h-7 bg-flamencalia-albero rounded-full" />
        </div>
        <div
          className="absolute top-12 right-[25%] farolillo opacity-20"
          style={{ animationDelay: "1s" }}
        >
          <div className="w-6 h-8 bg-flamencalia-albero-light rounded-full" />
        </div>

        <div className="relative text-center px-12">
          <Image
            src="/cliente/Abanico.svg"
            alt="Flamencalia"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <h2 className="font-serif text-3xl font-bold text-white mb-3">
            FLAMENCALIA
          </h2>
          <p className="text-flamencalia-albero-light/80 italic text-lg mb-4">
            &ldquo;Larga vida a tu Flamenca&rdquo;
          </p>
          <p className="text-white/50 max-w-sm text-sm">
            Tu marketplace de moda flamenca. Vestidos, mantones, complementos y
            mucho más.
          </p>
        </div>
      </div>
      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center bg-flamencalia-cream px-6">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="lg:hidden flex items-center justify-center gap-2.5 mb-8"
          >
            <Image
              src="/cliente/Abanico.svg"
              alt="Flamencalia"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div className="text-center">
              <span className="font-serif font-bold text-xl tracking-wide text-flamencalia-black">
                FLAMENCALIA
              </span>
              <p className="text-[10px] text-flamencalia-red italic -mt-0.5">
                &ldquo;Larga vida a tu Flamenca&rdquo;
              </p>
            </div>
          </Link>
          <div className="bg-flamencalia-white rounded-2xl shadow-sm border border-flamencalia-albero-pale/50 p-8">
            {children}
          </div>
          <p className="text-xs text-neutral-400 text-center mt-6">
            &copy; 2026 Flamencalia. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

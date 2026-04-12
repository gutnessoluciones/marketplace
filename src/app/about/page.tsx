import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Quiénes Somos — Flamencalia",
  description:
    "Flamencalia nace de una idea muy sencilla: que la moda flamenca no tenga una sola vida. Un espacio para comprar, vender y dar nueva vida a la flamenca.",
};

const VALUES = [
  {
    icon: "heart",
    title: "Moda con historia",
    text: "Cada pieza tiene una historia. Queremos que siga formando parte de nuevas vivencias, manteniendo su valor y su esencia.",
  },
  {
    icon: "users",
    title: "Comunidad flamenca",
    text: "Conectamos a quienes crean, quienes buscan algo especial y quienes quieren dar una nueva oportunidad a sus prendas.",
  },
  {
    icon: "sparkle",
    title: "Consumo consciente",
    text: "Creemos en una forma de consumo donde cada prenda importa y puede seguir teniendo recorrido.",
  },
  {
    icon: "dress",
    title: "Todo flamenco",
    text: "Desde un traje hasta el último detalle que completa un look. Todo al alcance en un solo espacio.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-flamencalia-cream">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-flamencalia-black text-white">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/categorias/feria.jpg"
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-flamencalia-black/60 via-flamencalia-black/40 to-flamencalia-black/80" />

        {/* Toldo decorativo superior */}
        <div className="relative h-1.5 toldo-rayas" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-28 text-center">
          {/* Logo abanico */}
          <div className="flex justify-center mb-5 animate-fade-in-up">
            <Image
              src="/cliente/Abanico.svg"
              alt=""
              width={64}
              height={64}
              className="w-14 h-14 sm:w-18 sm:h-18 drop-shadow-lg"
            />
          </div>

          {/* Marca */}
          <div
            className="flex justify-center mb-4 animate-fade-in-up"
            style={{ animationDelay: "0.05s" }}
          >
            <Image
              src="/cliente/marca-flamencalia.svg"
              alt="FLAMENCALIA"
              width={400}
              height={60}
              className="h-8 sm:h-12 w-auto object-contain invert drop-shadow-lg"
            />
          </div>

          {/* Línea decorativa */}
          <div
            className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="h-px w-12 bg-flamencalia-albero/50" />
            <span className="text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase text-flamencalia-albero">
              Nuestra historia
            </span>
            <div className="h-px w-12 bg-flamencalia-albero/50" />
          </div>

          <h1
            className="font-serif text-3xl sm:text-5xl font-light leading-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            Larga vida a tu{" "}
            <span className="text-flamencalia-albero font-normal italic">
              flamenca
            </span>
          </h1>
          <p
            className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Flamencalia nace de una idea muy sencilla: que la moda flamenca no
            tenga una sola vida.
          </p>
        </div>

        {/* Onda inferior */}
        <div className="relative">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-10 sm:h-16"
          >
            <path
              d="M0 80V40C180 10 360 0 540 15s360 30 540 15 180-20 360-15v65H0z"
              fill="var(--flamencalia-cream)"
            />
          </svg>
        </div>
      </section>

      {/* Story — client text */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/50 p-6 sm:p-10 shadow-sm">
          <div className="space-y-5 text-neutral-600 leading-relaxed text-sm sm:text-base">
            <p>
              Surge como un espacio donde comprar y vender vestidos y
              complementos flamencos de forma fácil, cuidada y cercana. Un lugar
              pensado para que cada pieza pueda seguir formando parte de nuevas
              historias, manteniendo su valor y su esencia.
            </p>
            <p>
              <strong className="text-neutral-800">
                Flamencalia conecta a personas que comparten una misma pasión.
              </strong>{" "}
              Aquí conviven quienes crean, quienes buscan algo especial y
              quienes quieren dar una nueva oportunidad a prendas que todavía
              tienen mucho que aportar. Todo dentro de un entorno centrado
              exclusivamente en el universo flamenco.
            </p>
            <p>
              Nuestro objetivo es construir una red donde todo esté al alcance:
              desde un traje hasta el último detalle que completa un look. Un
              espacio donde descubrir, inspirarse y encontrar piezas únicas, sin
              perder la identidad ni la tradición que hacen especial a la moda
              flamenca.
            </p>
            <p>
              Creemos en una forma de consumo más consciente, donde cada prenda
              importa y puede seguir teniendo recorrido. Porque la flamenca no
              se entiende como algo puntual, sino como una expresión que
              evoluciona, se comparte y se vuelve a vivir.
            </p>
            <p className="text-neutral-800 font-semibold text-base sm:text-lg pt-5 border-t border-flamencalia-albero-pale/40">
              Flamencalia es eso: un punto de encuentro para comprar, vender y
              seguir dando vida a la flamenca.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-flamencalia-white border-y border-flamencalia-albero-pale/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 text-center mb-10">
            Lo que nos mueve
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-flamencalia-cream rounded-2xl p-5 sm:p-6 border border-flamencalia-albero-pale/20"
              >
                <div className="w-10 h-10 bg-flamencalia-albero/10 rounded-xl flex items-center justify-center mb-3">
                  <Icon
                    name={v.icon as "heart" | "users" | "sparkle" | "dress"}
                    className="w-5 h-5 text-flamencalia-albero"
                  />
                </div>
                <h3 className="text-sm font-bold text-neutral-800 mb-1.5">
                  {v.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 mb-3">
          ¿Te unes a Flamencalia?
        </h2>
        <p className="text-sm text-neutral-500 mb-8 max-w-lg mx-auto">
          Tanto si buscas algo especial como si quieres dar nueva vida a tus
          prendas, este es tu sitio.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-flamencalia-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all"
          >
            Explorar productos
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 border-2 border-flamencalia-albero text-flamencalia-albero px-6 py-3 rounded-xl text-sm font-bold hover:bg-flamencalia-albero hover:text-white transition-all"
          >
            Crear cuenta
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

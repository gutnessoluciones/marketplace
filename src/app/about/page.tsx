import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { UserNav } from "@/components/layout/user-nav";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Quiénes Somos — Flamencalia",
  description:
    "Conoce la historia de Flamencalia, el marketplace de moda flamenca que conecta diseñadores y amantes de la flamenca.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-flamencalia-cream">
      {/* Header */}
      <header className="bg-flamencalia-white sticky top-0 z-30 shadow-sm">
        <div className="h-1.5 toldo-rayas" />
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/cliente/flamencalia.jpg"
              alt="Flamencalia"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div className="hidden sm:block">
              <span className="font-serif font-bold text-xl tracking-wide text-flamencalia-black">
                FLAMENCALIA
              </span>
              <p className="text-[10px] text-flamencalia-red italic -mt-0.5">
                &ldquo;Larga vida a tu Flamenca&rdquo;
              </p>
            </div>
          </Link>
          <UserNav variant="light" />
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-flamencalia-red via-flamencalia-red-dark to-flamencalia-black py-20 sm:py-28">
        {/* Farolillos decorativos */}
        <div className="absolute top-4 left-[12%] farolillo opacity-40">
          <div className="w-5 h-7 bg-flamencalia-albero rounded-full" />
        </div>
        <div
          className="absolute top-6 right-[18%] farolillo opacity-30"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="w-6 h-8 bg-flamencalia-albero-light rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <Icon name="fan" className="w-4 h-4" /> Nuestra Historia
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Quiénes <span className="text-flamencalia-albero-light">Somos</span>
          </h1>
          <p className="mt-5 text-lg text-white/70 max-w-2xl mx-auto">
            Una comunidad flamenca donde la tradición, el estilo y la
            sostenibilidad se encuentran.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path
              d="M0 60V30C240 0 480 0 720 30s480 30 720 0v30H0z"
              fill="var(--flamencalia-cream)"
            />
          </svg>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Intro */}
        <section className="mb-16 animate-fade-in-up">
          <div className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/50 p-8 sm:p-12 shadow-sm">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-flamencalia-black mb-6">
              Nace <span className="text-flamencalia-red">Flamencalia</span>
            </h2>
            <div className="space-y-4 text-flamencalia-black/70 leading-relaxed">
              <p>
                Flamencalia nace de la pasión por la moda flamenca y la
                necesidad de crear un espacio donde{" "}
                <strong className="text-flamencalia-black">
                  diseñadores, artesanos y amantes de la flamenca
                </strong>{" "}
                puedan conectar, comprar y vender con confianza.
              </p>
              <p>
                Somos un marketplace que une lo mejor de dos mundos: productos
                nuevos de diseñadores con talento y piezas de segunda mano de la
                comunidad flamenca, dándole
                <strong className="text-flamencalia-red">
                  {" "}
                  larga vida a tu flamenca
                </strong>
                .
              </p>
              <p>
                Creemos en la moda circular y en que un buen traje de flamenca
                merece más de una temporada de feria. Cada vestido tiene una
                historia, y en Flamencalia ayudamos a que esa historia continúe.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-flamencalia-black text-center mb-8">
            Nuestros Valores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: "fan",
                title: "Comunidad",
                desc: "Creamos una red flamenca donde diseñadores y amantes de la moda se encuentran, comparten y crecen juntos.",
                color: "text-flamencalia-red",
              },
              {
                icon: "heart",
                title: "Sostenibilidad",
                desc: "Impulsamos la moda circular. Cada prenda reutilizada es un paso hacia un mundo más sostenible y consciente.",
                color: "text-flamencalia-albero",
              },
              {
                icon: "star",
                title: "Confianza",
                desc: "Cada producto es revisado por nuestro equipo. Compra y vende con la tranquilidad de una plataforma segura.",
                color: "text-flamencalia-red",
              },
            ].map((value, i) => (
              <div
                key={value.title}
                className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/50 p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`${value.color} mb-4`}>
                  <Icon name={value.icon} className="w-10 h-10 mx-auto" />
                </div>
                <h3 className="font-serif font-bold text-lg text-flamencalia-black mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-flamencalia-black/60 leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-flamencalia-black text-center mb-8">
            ¿Cómo funciona?
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Regístrate",
                desc: "Crea tu perfil como cliente o proveedor. Es gratis y solo lleva un minuto.",
              },
              {
                step: "2",
                title: "Explora o Publica",
                desc: "Descubre productos increíbles de diseñadores y la comunidad, o sube tus propias prendas para vender.",
              },
              {
                step: "3",
                title: "Compra con Confianza",
                desc: "Todos los productos son revisados por nuestro equipo. Pago seguro y protegido.",
              },
              {
                step: "4",
                title: "Disfruta y Comparte",
                desc: "Recibe tu pedido, disfruta de tu flamenca y comparte tu estilo con la comunidad.",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="flex items-start gap-5 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-flamencalia-red text-white font-serif font-bold text-lg flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-flamencalia-black">
                    {item.title}
                  </h3>
                  <p className="text-sm text-flamencalia-black/60 mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Target audience */}
        <section className="mb-16">
          <div className="bg-linear-to-br from-flamencalia-albero-pale to-flamencalia-cream rounded-2xl p-8 sm:p-12 border border-flamencalia-albero/20">
            <h2 className="font-serif text-2xl font-bold text-flamencalia-black mb-4">
              ¿A quién va dirigido?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-flamencalia-black/70">
              <div>
                <h3 className="font-bold text-flamencalia-black mb-2 flex items-center gap-2">
                  <Icon name="dress" className="w-5 h-5 text-flamencalia-red" />{" "}
                  Amantes de la Flamenca
                </h3>
                <p>
                  Si buscas vestidos de flamenca, complementos o accesorios para
                  la feria, el Rocío o cualquier evento flamenco, aquí
                  encontrarás piezas únicas a los mejores precios.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-flamencalia-black mb-2 flex items-center gap-2">
                  <Icon
                    name="sparkle"
                    className="w-5 h-5 text-flamencalia-albero"
                  />{" "}
                  Diseñadores y Artesanos
                </h3>
                <p>
                  Si creas moda flamenca, Flamencalia es tu escaparate. Llega a
                  miles de personas apasionadas por la flamenca y haz crecer tu
                  negocio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="text-center">
          <h2 className="font-serif text-2xl font-bold text-flamencalia-black mb-3">
            ¿Alguna duda?
          </h2>
          <p className="text-flamencalia-black/60 mb-6">
            Escríbenos y te respondemos encantados.
          </p>
          <a
            href="mailto:info@flamencalia.com"
            className="inline-flex items-center gap-2 bg-flamencalia-red text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-flamencalia-red-dark transition-all hover:shadow-lg hover:shadow-flamencalia-red/20"
          >
            ✉ info@flamencalia.com
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}

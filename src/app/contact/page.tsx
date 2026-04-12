import { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { ContactForm } from "@/components/contact/contact-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contacto — Flamencalia",
  description:
    "Ponte en contacto con el equipo de Flamencalia. Estamos aquí para ayudarte.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-flamencalia-cream">
      {/* Header */}
      <header className="border-b border-flamencalia-albero/20 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="font-serif text-xl font-bold tracking-wider text-flamencalia-black"
          >
            FLAMENCALIA
          </Link>
          <Link
            href="/"
            className="text-sm text-flamencalia-albero hover:underline"
          >
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl font-bold text-flamencalia-black md:text-4xl">
            Contacto
          </h1>
          <p className="mt-3 text-flamencalia-black/60">
            ¿Tienes alguna pregunta, sugerencia o incidencia? Escríbenos y te
            responderemos lo antes posible.
          </p>
        </div>

        <div className="rounded-2xl border border-flamencalia-albero/20 bg-white p-6 shadow-sm md:p-10">
          <ContactForm />
        </div>

        <div className="mt-10 text-center text-sm text-flamencalia-black/50">
          <p>También puedes escribirnos directamente a:</p>
          <a
            href="mailto:info@flamencalia.es"
            className="mt-1 inline-block font-medium text-flamencalia-albero hover:underline"
          >
            info@flamencalia.es
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}

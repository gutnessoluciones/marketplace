import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies - GutnesPlace",
};

export default function CookiesPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Política de Cookies</h1>
      <p className="lead">
        Última actualización:{" "}
        {new Date().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos de texto que los sitios web colocan en
        tu dispositivo para almacenar información sobre tus preferencias y
        mejorar tu experiencia de navegación.
      </p>

      <h2>2. Cookies que utilizamos</h2>

      <h3>Cookies esenciales</h3>
      <p>
        Son necesarias para el funcionamiento de la plataforma. Incluyen cookies
        de autenticación y sesión gestionadas por Supabase Auth.
      </p>
      <ul>
        <li>
          <strong>sb-access-token / sb-refresh-token:</strong> Gestión de sesión
          de usuario. Duración: hasta cierre de sesión.
        </li>
      </ul>

      <h3>Cookies de funcionalidad</h3>
      <p>
        Almacenan tus preferencias como idioma y configuración de la interfaz.
      </p>

      <h3>Cookies de terceros</h3>
      <ul>
        <li>
          <strong>Stripe:</strong> Cookies necesarias para el procesamiento
          seguro de pagos y la prevención de fraude.
        </li>
      </ul>

      <h2>3. Gestión de cookies</h2>
      <p>
        Puedes configurar tu navegador para rechazar todas las cookies o para
        indicar cuándo se envía una cookie. Sin embargo, algunas funciones de la
        plataforma pueden no funcionar correctamente sin cookies.
      </p>

      <h2>4. Más información</h2>
      <p>
        Para más información sobre cómo gestionamos tus datos, consulta nuestra{" "}
        <a href="/legal/privacy">Política de Privacidad</a>.
      </p>
    </article>
  );
}

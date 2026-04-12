import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Términos y Condiciones - Flamencalia",
};

export default function TermsPage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1>Términos y Condiciones</h1>
      <p className="lead">
        Última actualización:{" "}
        {new Date().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <h2>1. Aceptación de los términos</h2>
      <p>
        Al acceder y utilizar Flamencalia, aceptas estos términos y condiciones
        en su totalidad. Si no estás de acuerdo, no debes utilizar la
        plataforma.
      </p>

      <h2>2. Descripción del servicio</h2>
      <p>
        Flamencalia es un marketplace online que conecta vendedores
        independientes con compradores. Actuamos como intermediario facilitando
        las transacciones entre las partes.
      </p>

      <h2>3. Registro de cuenta</h2>
      <ul>
        <li>Debes ser mayor de 18 años para crear una cuenta.</li>
        <li>Eres responsable de mantener la seguridad de tu cuenta.</li>
        <li>La información proporcionada debe ser veraz y actualizada.</li>
      </ul>

      <h2>4. Vendedores</h2>
      <ul>
        <li>
          Los vendedores son responsables de la veracidad de sus listados.
        </li>
        <li>
          Deben cumplir con todas las leyes aplicables de comercio electrónico.
        </li>
        <li>
          Flamencalia cobra una comisión del 10% sobre cada venta completada.
        </li>
        <li>Los pagos se procesan a través de Stripe Connect.</li>
      </ul>

      <h2>5. Compradores</h2>
      <ul>
        <li>
          Las compras se realizan directamente entre comprador y vendedor.
        </li>
        <li>Flamencalia no es responsable de la calidad de los productos.</li>
        <li>
          Las disputas deben resolverse primero entre las partes involucradas.
        </li>
      </ul>

      <h2>6. Pagos</h2>
      <p>
        Todos los pagos se procesan de forma segura a través de Stripe. No
        almacenamos información de tarjetas de crédito en nuestros servidores.
      </p>

      <h2>7. Contenido prohibido</h2>
      <p>Está prohibido publicar productos que:</p>
      <ul>
        <li>Sean ilegales o infrinjan derechos de terceros.</li>
        <li>Sean falsificaciones o réplicas no autorizadas.</li>
        <li>Contengan material ofensivo o peligroso.</li>
      </ul>

      <h2>8. Limitación de responsabilidad</h2>
      <p>
        Flamencalia actúa como plataforma intermediaria y no se hace responsable
        de las transacciones entre compradores y vendedores más allá de
        facilitar la tecnología para las mismas.
      </p>

      <h2>9. Modificaciones</h2>
      <p>
        Nos reservamos el derecho de modificar estos términos. Los cambios serán
        efectivos desde su publicación en la plataforma.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Para consultas legales, puedes contactarnos en{" "}
        <a href="https://flamencalia.com" target="_blank" rel="noopener noreferrer">
          flamencalia.com
        </a>
        .
      </p>
    </article>
  );
}

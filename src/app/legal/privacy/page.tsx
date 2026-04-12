import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Política de Privacidad - Flamencalia",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1>Política de Privacidad</h1>
      <p className="lead">
        Última actualización:{" "}
        {new Date().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        Flamencalia, accesible desde flamencalia.com, es responsable del tratamiento
        de los datos personales recogidos a través de esta plataforma.
      </p>

      <h2>2. Datos que recopilamos</h2>
      <ul>
        <li>
          <strong>Datos de registro:</strong> nombre, dirección de correo
          electrónico y contraseña.
        </li>
        <li>
          <strong>Datos de perfil:</strong> nombre público, avatar e información
          de contacto.
        </li>
        <li>
          <strong>Datos de transacciones:</strong> historial de compras,
          direcciones de envío e información de pago procesada por Stripe.
        </li>
        <li>
          <strong>Datos de uso:</strong> páginas visitadas, interacciones con la
          plataforma y datos técnicos del navegador.
        </li>
      </ul>

      <h2>3. Finalidad del tratamiento</h2>
      <p>Utilizamos tus datos para:</p>
      <ul>
        <li>Gestionar tu cuenta y proporcionar nuestros servicios.</li>
        <li>Procesar transacciones y pagos de forma segura.</li>
        <li>Comunicarte información relevante sobre tus pedidos.</li>
        <li>Mejorar la experiencia de usuario de la plataforma.</li>
      </ul>

      <h2>4. Compartición de datos</h2>
      <p>
        No vendemos tus datos personales. Compartimos información limitada con:
      </p>
      <ul>
        <li>
          <strong>Stripe:</strong> para el procesamiento seguro de pagos.
        </li>
        <li>
          <strong>Supabase:</strong> como proveedor de infraestructura y base de
          datos.
        </li>
        <li>
          <strong>Vendedores:</strong> datos de envío necesarios para cumplir
          con el pedido.
        </li>
      </ul>

      <h2>5. Tus derechos</h2>
      <p>
        De acuerdo con el RGPD, tienes derecho a acceder, rectificar, eliminar y
        portar tus datos personales. Para ejercer estos derechos, contacta con
        nosotros a través de la plataforma.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        Implementamos medidas de seguridad técnicas y organizativas para
        proteger tus datos, incluyendo cifrado en tránsito (HTTPS) y
        autenticación segura.
      </p>

      <h2>7. Contacto</h2>
      <p>
        Para cualquier consulta sobre privacidad, puedes contactarnos en{" "}
        <a href="https://flamencalia.com" target="_blank" rel="noopener noreferrer">
          flamencalia.com
        </a>
        .
      </p>
    </article>
  );
}

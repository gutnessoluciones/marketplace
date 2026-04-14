/**
 * Script para generar logos PNG para emails a partir de los SVGs originales.
 *
 * Crea versiones en blanco del logo "FLAMENCALIA" (marca-flamencalia.svg)
 * y del slogan (slogan.svg) optimizados para el header oscuro de los emails.
 *
 * Los SVGs no se renderizan en la mayoría de clientes de email (Gmail, Outlook, Yahoo),
 * por eso se convierten a PNG.
 *
 * Uso: node scripts/generate-email-logos.mjs
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const OUTPUT_DIR = path.join(PUBLIC_DIR, "email");

// Crear directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateLogo() {
  // 1. Logo FLAMENCALIA en blanco (para header oscuro)
  const marcaSvg = fs.readFileSync(
    path.join(PUBLIC_DIR, "cliente", "marca-flamencalia.svg"),
    "utf-8",
  );

  // Cambiar fill a blanco: los paths originales son negros (sin fill explícito)
  const marcaBlanca = marcaSvg.replace(
    'style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"',
    'style="fill:white;fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"',
  );

  // Guardar SVG blanco como copia
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "marca-flamencalia-white.svg"),
    marcaBlanca,
  );

  // Convertir a PNG — ancho 500px, fondo transparente
  await sharp(Buffer.from(marcaBlanca))
    .resize(500)
    .png()
    .toFile(path.join(OUTPUT_DIR, "logo-email.png"));

  console.log("✅ logo-email.png generado (marca blanca, 500px ancho)");

  // 2. Slogan en blanco + dorado (ya tiene fill:white, mantener dorado)
  const sloganSvg = fs.readFileSync(
    path.join(PUBLIC_DIR, "cliente", "slogan.svg"),
    "utf-8",
  );

  // El slogan ya tiene fill:white en el svg root y rgb(212,168,67) en elementos dorados
  // Solo necesitamos convertir a PNG
  await sharp(Buffer.from(sloganSvg))
    .resize(500)
    .png()
    .toFile(path.join(OUTPUT_DIR, "slogan-email.png"));

  console.log("✅ slogan-email.png generado (blanco + dorado, 500px ancho)");

  // 3. También generar versión roja del logo para posible uso en footer claro
  const marcaRoja = marcaSvg.replace(
    'style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"',
    'style="fill:#c8102e;fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"',
  );

  await sharp(Buffer.from(marcaRoja))
    .resize(400)
    .png()
    .toFile(path.join(OUTPUT_DIR, "logo-email-red.png"));

  console.log("✅ logo-email-red.png generado (marca roja, 400px ancho)");
}

generateLogo().catch(console.error);

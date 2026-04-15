/**
 * Quick email test — sends a test email via Brevo transactional API.
 * Usage: node scripts/test-email.mjs [email@example.com]
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=["']?([^"'\n]*)["']?$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@flamencalia.com";
const senderName = process.env.BREVO_SENDER_NAME || "Flamencalia";

if (!apiKey || apiKey === "TU_API_KEY_AQUI") {
  console.error("❌ Missing or placeholder BREVO_API_KEY in .env.local");
  console.error("   Get your key at: https://app.brevo.com/settings/keys/api");
  process.exit(1);
}

const TO = process.argv[2] || "vendedor@marketplace.com";

console.log("📧 Testing Brevo transactional email...");
console.log(`   Sender: ${senderName} <${senderEmail}>`);
console.log(`   To:     ${TO}`);

try {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: TO }],
      replyTo: { email: "info@flamencalia.com" },
      subject: "✅ Test Flamencalia — Email funciona!",
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #c8102e;">🎉 ¡Email funcionando!</h2>
          <p>Este es un email de prueba enviado desde <strong>flamencalia.com</strong> usando Brevo.</p>
          <p>Fecha: ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
          <hr style="border: 1px solid #f5e6c0;" />
          <p style="font-size: 12px; color: #999;">Flamencalia — Larga vida a tu Flamenca</p>
        </div>
      `,
      tags: ["test"],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`\n❌ Brevo API error (HTTP ${response.status}):`);
    console.error(`   ${errorBody}`);
    process.exit(1);
  }

  const result = await response.json();
  console.log(`\n✅ Email sent successfully to ${TO}!`);
  console.log(`   Message ID: ${result.messageId || "n/a"}`);
  console.log("   Check the inbox (and spam folder) for the test email.");
} catch (error) {
  console.error("\n❌ Error sending email:");
  console.error(`   ${error.message}`);
}

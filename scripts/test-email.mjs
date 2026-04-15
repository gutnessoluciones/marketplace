/**
 * Quick email test — sends a test email via Microsoft Graph API.
 * Usage: node scripts/test-email.mjs
 */
import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const tenantId = process.env.MS_TENANT_ID;
const clientId = process.env.MS_CLIENT_ID;
const clientSecret = process.env.MS_CLIENT_SECRET;
const sender = process.env.MS_SENDER || "noreply@flamencalia.com";

if (!tenantId || !clientId || !clientSecret) {
  console.error(
    "❌ Missing MS_TENANT_ID, MS_CLIENT_ID, or MS_CLIENT_SECRET in .env.local",
  );
  process.exit(1);
}

// Target: send to specified email or default test
const TO = process.argv[2] || "vendedor@marketplace.com";

console.log("📧 Testing Graph API email...");
console.log(`   Tenant: ${tenantId}`);
console.log(`   Client: ${clientId}`);
console.log(`   Sender: ${sender}`);
console.log(`   To:     ${TO}`);

try {
  const credential = new ClientSecretCredential(
    tenantId,
    clientId,
    clientSecret,
  );
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ["https://graph.microsoft.com/.default"],
  });
  const client = Client.initWithMiddleware({ authProvider });

  console.log("\n🔑 Acquiring token...");

  await client.api(`/users/${sender}/sendMail`).post({
    message: {
      subject: "✅ Test Flamencalia — Email funciona!",
      body: {
        contentType: "HTML",
        content: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #c8102e;">🎉 ¡Email funcionando!</h2>
              <p>Este es un email de prueba enviado desde <strong>flamencalia.com</strong> usando Microsoft Graph API.</p>
              <p>Fecha: ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
              <hr style="border: 1px solid #f5e6c0;" />
              <p style="font-size: 12px; color: #999;">Flamencalia — Larga vida a tu Flamenca</p>
            </div>
          `,
      },
      toRecipients: [{ emailAddress: { address: TO } }],
      from: { emailAddress: { address: sender } },
      replyTo: [{ emailAddress: { address: "info@flamencalia.com" } }],
    },
    saveToSentItems: true,
  });

  console.log(`\n✅ Email sent successfully to ${TO}!`);
  console.log("   Check the inbox (and spam folder) for the test email.");
} catch (error) {
  console.error("\n❌ Error sending email:");
  if (error.statusCode) console.error(`   HTTP ${error.statusCode}`);
  if (error.code) console.error(`   Code: ${error.code}`);
  if (error.body) {
    try {
      const body =
        typeof error.body === "string" ? JSON.parse(error.body) : error.body;
      console.error(
        `   Message: ${body?.error?.message || JSON.stringify(body)}`,
      );
    } catch {
      console.error(`   Body: ${error.body}`);
    }
  } else {
    console.error(`   ${error.message}`);
  }
}

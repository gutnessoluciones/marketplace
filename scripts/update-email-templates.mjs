#!/usr/bin/env node
/**
 * Script to update Supabase email templates via Management API
 */

const SUPABASE_ACCESS_TOKEN =
  process.argv[2] || "sbp_ddfc29207c2a36631eb8c0079f1af347bfd2bfc2";
const PROJECT_REF = "hyolejmmvsizlceaslum";

// ── Templates ────────────────────────────────────────────────

// URL base para imágenes (hardcoded — {{ .SiteURL }} puede apuntar a Supabase, no a Vercel)
const IMG_BASE = "https://marketplace-three-mu.vercel.app";

const HEADER = `<div style="max-width:520px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><div style="background:linear-gradient(135deg,#1A1A1A,#C8102E);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center"><img src="${IMG_BASE}/email/logo-email.png" alt="Flamencalia" width="280" style="margin-bottom:8px"/><img src="${IMG_BASE}/email/slogan-email.png" alt="Larga vida a tu Flamenca" width="220" style="display:block;margin:0 auto"/></div>`;

const BODY_START = `<div style="background:#ffffff;padding:32px 24px;border:1px solid #e2e8f0;border-top:none">`;
const BODY_END = `</div>`;

const FOOTER = `<div style="background:#fff9f0;border-radius:0 0 16px 16px;padding:16px 24px;text-align:center;border:1px solid #e2e8f0;border-top:none"><img src="${IMG_BASE}/email/logo-email-red.png" alt="Flamencalia" width="120" style="margin-bottom:8px"/><p style="color:#94a3b8;font-size:11px;margin:0">&copy; 2026 Flamencalia. Todos los derechos reservados.</p></div></div>`;

const BUTTON = (href, text) =>
  `<div style="text-align:center;margin:24px 0"><a href="${href}" style="display:inline-block;background:#C8102E;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 32px;border-radius:12px">${text}</a></div>`;

const DISCLAIMER = (text) =>
  `<p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:24px 0 0">${text}</p>`;

function makeTemplate(title, description, buttonHref, buttonText, disclaimer) {
  return `${HEADER}${BODY_START}<h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">${title}</h2><p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px">${description}</p>${BUTTON(buttonHref, buttonText)}${DISCLAIMER(disclaimer)}${BODY_END}${FOOTER}`;
}

const templates = {
  // Confirm signup
  mailer_templates_confirmation_content: makeTemplate(
    "¡Bienvenido! 🎉",
    "Gracias por registrarte en Flamencalia. Para activar tu cuenta y empezar a explorar, confirma tu dirección de correo electrónico.",
    "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/dashboard",
    "Confirmar mi cuenta",
    "Si no creaste esta cuenta, ignora este correo. El enlace expira en 24 horas.",
  ),

  // Magic link
  mailer_templates_magic_link_content: makeTemplate(
    "Inicia sesión",
    "Haz clic en el botón para acceder a tu cuenta de Flamencalia.",
    "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/dashboard",
    "Acceder a mi cuenta",
    "Si no solicitaste este acceso, ignora este correo. El enlace expira en 1 hora.",
  ),

  // Email change
  mailer_templates_email_change_content: makeTemplate(
    "Cambio de email",
    "Has solicitado cambiar tu dirección de correo. Haz clic en el botón para confirmar tu nueva dirección.",
    "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/dashboard/settings",
    "Confirmar nuevo email",
    "Si no solicitaste este cambio, ignora este correo.",
  ),

  // Password recovery
  mailer_templates_recovery_content: makeTemplate(
    "Restablecer contraseña",
    "Has solicitado restablecer tu contraseña. Haz clic en el botón para crear una nueva.",
    "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/dashboard/settings",
    "Restablecer contraseña",
    "Si no solicitaste esto, ignora este correo. El enlace expira en 1 hora.",
  ),

  // Invite
  mailer_templates_invite_content: makeTemplate(
    "¡Estás invitado! 🎉",
    "Has sido invitado a unirte a Flamencalia. Haz clic en el botón para aceptar la invitación y crear tu cuenta.",
    "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/dashboard",
    "Aceptar invitación",
    "Si no esperabas esta invitación, ignora este correo.",
  ),
};

// Also set subjects (already set but ensure consistency)
const subjects = {
  mailer_subjects_confirmation: "Confirma tu cuenta en Flamencalia",
  mailer_subjects_magic_link: "Tu enlace de acceso a Flamencalia",
  mailer_subjects_email_change: "Confirma tu nuevo email en Flamencalia",
  mailer_subjects_recovery: "Restablece tu contraseña en Flamencalia",
  mailer_subjects_invite: "Has sido invitado a Flamencalia",
};

const payload = { ...templates, ...subjects };

async function main() {
  console.log("Actualizando email templates en Supabase...\n");

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (res.ok) {
    const data = await res.json();
    console.log("✅ Templates actualizados correctamente.");
    console.log("\nTemplates configurados:");
    Object.keys(templates).forEach((k) => {
      const name = k.replace("mailer_templates_", "").replace("_content", "");
      console.log(`  ✓ ${name}`);
    });
    console.log("\nSubjects configurados:");
    Object.keys(subjects).forEach((k) => {
      const name = k.replace("mailer_subjects_", "");
      console.log(`  ✓ ${name}: "${subjects[k]}"`);
    });
  } else {
    const err = await res.text();
    console.error("❌ Error:", res.status, err);
  }
}

main().catch(console.error);

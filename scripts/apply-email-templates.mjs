import { readFileSync } from "fs";

const PAT = "sbp_bf486425d0c55f6d1641056aeca82078bec6f2f6";
const PROJECT_REF = "hyolejmmvsizlceaslum";

const html = readFileSync("supabase/email-templates.html", "utf8");

// Split between TEMPLATE markers
function extractBetween(text, startLabel, endLabel) {
  const startIdx = text.indexOf(startLabel);
  if (startIdx === -1) return null;
  const afterStart = text.indexOf("-->", startIdx);
  if (afterStart === -1) return null;
  
  let endIdx;
  if (endLabel) {
    endIdx = text.indexOf(endLabel, afterStart);
    if (endIdx === -1) endIdx = text.length;
  } else {
    endIdx = text.length;
  }
  
  return text.slice(afterStart + 3, endIdx).trim();
}

const t1 = extractBetween(html, "TEMPLATE 1:", "TEMPLATE 2:");
const t2 = extractBetween(html, "TEMPLATE 2:", "TEMPLATE 3:");
const t3 = extractBetween(html, "TEMPLATE 3:", "TEMPLATE 4:");
const t4 = extractBetween(html, "TEMPLATE 4:", "TEMPLATE 5:");
const t5 = extractBetween(html, "TEMPLATE 5:", null);

console.log("T1 length:", t1?.length || 0);
console.log("T2 length:", t2?.length || 0);
console.log("T3 length:", t3?.length || 0);
console.log("T4 length:", t4?.length || 0);
console.log("T5 length:", t5?.length || 0);

const config = {
  MAILER_SUBJECTS_CONFIRMATION: "Confirma tu cuenta en Flamencalia",
  MAILER_SUBJECTS_MAGIC_LINK: "Tu enlace de acceso a Flamencalia",
  MAILER_SUBJECTS_EMAIL_CHANGE: "Confirma tu nuevo email en Flamencalia",
  MAILER_SUBJECTS_RECOVERY: "Restablece tu contraseña en Flamencalia",
  MAILER_SUBJECTS_INVITE: "Has sido invitado a Flamencalia",
};

if (t1) config.MAILER_TEMPLATES_CONFIRMATION_CONTENT = t1;
if (t2) config.MAILER_TEMPLATES_MAGIC_LINK_CONTENT = t2;
if (t3) config.MAILER_TEMPLATES_EMAIL_CHANGE_CONTENT = t3;
if (t4) config.MAILER_TEMPLATES_RECOVERY_CONTENT = t4;
if (t5) config.MAILER_TEMPLATES_INVITE_CONTENT = t5;

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${PAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  }
);

if (!res.ok) {
  console.error("Error:", res.status, await res.text());
} else {
  console.log("Email templates applied to Supabase successfully");
}

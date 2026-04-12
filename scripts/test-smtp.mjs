import nodemailer from "nodemailer";

const t = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: { user: "info@flamencalia.com", pass: "3Q7L6nO6ku2@26" },
  tls: { ciphers: "SSLv3" },
});

try {
  const r = await t.sendMail({
    from: "Flamencalia <soporte@flamencalia.com>",
    to: "info@flamencalia.com",
    subject: "Test SMTP - Flamencalia emails funcionando",
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#fff9f0;padding:32px;border-radius:12px">
      <div style="background:#1a1a1a;padding:16px;text-align:center;border-radius:8px 8px 0 0">
        <span style="color:white;font-family:Georgia,serif;font-size:18px;letter-spacing:2px">FLAMENCALIA</span>
      </div>
      <div style="background:white;padding:24px;border-radius:0 0 8px 8px">
        <h2 style="color:#1a1a1a">Emails configurados correctamente</h2>
        <p style="color:#555">Los emails transaccionales de Flamencalia funcionan via Office365 SMTP.</p>
        <p style="color:#999;font-size:12px">Enviado el ${new Date().toLocaleString("es-ES")}</p>
      </div>
    </div>`,
  });
  console.log("Email enviado OK:", r.messageId);
} catch (e) {
  console.error("Error:", e.message);
}

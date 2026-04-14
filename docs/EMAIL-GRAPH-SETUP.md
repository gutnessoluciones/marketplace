# Email — Microsoft Graph API

## Arquitectura

El sistema de email de Flamencalia usa **Microsoft Graph API** con OAuth 2.0 (client credentials flow) para enviar correos transaccionales desde `noreply@flamencalia.com`.

```
src/lib/email/
├── config.ts         # Validación de variables de entorno
├── graph-client.ts   # Cliente Graph autenticado (Azure Identity)
├── graph-send.ts     # Función de envío bajo nivel (POST /users/{sender}/sendMail)
├── templates.ts      # Plantillas HTML responsive
└── index.ts          # API pública: sendEmail() + funciones por tipo

src/lib/email.ts      # Barrel de re-export (compatibilidad con imports existentes)
src/app/api/test-email/route.ts  # Endpoint de prueba (protegido)
```

## Variables de Entorno

```env
# Microsoft Entra (Azure AD) — OBLIGATORIAS
MS_TENANT_ID=<tu-tenant-id>
MS_CLIENT_ID=<tu-client-id>
MS_CLIENT_SECRET=<tu-client-secret>

# Remitente y Reply-To (opcionales, tienen valores por defecto)
MS_SENDER=noreply@flamencalia.com
MS_REPLY_TO=info@flamencalia.com
```

> Configúralas en **Vercel → Settings → Environment Variables** (Production + Preview).  
> NUNCA las incluyas en el código fuente ni en `.env.local` para producción.

## Configuración en Microsoft Entra ID (Azure AD)

### 1. Crear App Registration

1. Ve a [Azure Portal → Microsoft Entra ID → App registrations](https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click **"New registration"**
3. Nombre: `Flamencalia Email Service`
4. Tipo de cuenta: **"Accounts in this organizational directory only"** (Single tenant)
5. Redirect URI: déjalo vacío (no necesitamos callback)
6. Click **"Register"**
7. Anota el **Application (client) ID** → es tu `MS_CLIENT_ID`
8. Anota el **Directory (tenant) ID** → es tu `MS_TENANT_ID`

### 2. Crear Client Secret

1. En la app registration, ve a **Certificates & secrets**
2. Click **"New client secret"**
3. Descripción: `Flamencalia-Production`
4. Expiración: **24 months** (pon recordatorio para rotar)
5. Anota el **Value** → es tu `MS_CLIENT_SECRET` (solo se muestra una vez)

### 3. Asignar Permiso Mail.Send

1. En la app registration, ve a **API permissions**
2. Click **"Add a permission"**
3. Selecciona **"Microsoft Graph"**
4. Selecciona **"Application permissions"** (NO delegated)
5. Busca y marca **`Mail.Send`**
6. Click **"Add permissions"**
7. Click **"Grant admin consent for [tu tenant]"** (requiere ser Global Admin)
8. Verifica que el estado muestre ✅ "Granted for..."

### 4. Verificar buzón remitente

- `noreply@flamencalia.com` debe existir como **buzón compartido** (Shared Mailbox) o buzón regular en Microsoft 365.
- Si es buzón compartido, no necesita licencia.
- Crear en: [Microsoft 365 Admin → Teams & groups → Shared mailboxes](https://admin.microsoft.com/#/SharedMailboxes)

### 5. (Recomendado) Restringir con Application Access Policy

Para que la app solo pueda enviar desde `noreply@flamencalia.com` y no desde cualquier buzón del tenant:

```powershell
# En PowerShell con Exchange Online Management Module
Connect-ExchangeOnline

# Crear grupo de seguridad con solo el buzón noreply
New-DistributionGroup -Name "GraphMailSenders" -Type Security -Members noreply@flamencalia.com

# Crear política de acceso restringido
New-ApplicationAccessPolicy `
  -AppId "<MS_CLIENT_ID>" `
  -PolicyScopeGroupId "GraphMailSenders" `
  -AccessRight RestrictAccess `
  -Description "Flamencalia: solo noreply@flamencalia.com"

# Verificar
Test-ApplicationAccessPolicy -Identity noreply@flamencalia.com -AppId "<MS_CLIENT_ID>"
```

## Probar el Envío

### Desde desarrollo local

```bash
# Asegúrate de tener las variables en .env.local:
# MS_TENANT_ID=...
# MS_CLIENT_ID=...
# MS_CLIENT_SECRET=...

curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -H "x-test-secret: flamencalia-dev-test" \
  -d '{"to": "tu-email@ejemplo.com"}'
```

### Desde producción (requiere sesión de admin)

Navega a cualquier ruta autenticada como admin (owner/dev) y haz un POST a `/api/test-email`:

```bash
curl -X POST https://marketplace-three-mu.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -H "Cookie: <tu-cookie-de-sesión>" \
  -d '{"to": "tu-email@ejemplo.com"}'
```

## Checklist de Despliegue

- [ ] App registration creada en Microsoft Entra ID
- [ ] Client secret creado (y guardado de forma segura)
- [ ] Permiso **Mail.Send** (Application) añadido
- [ ] **Admin consent** concedido por Global Admin
- [ ] Buzón `noreply@flamencalia.com` existente (shared mailbox o regular)
- [ ] Variable `MS_TENANT_ID` en Vercel
- [ ] Variable `MS_CLIENT_ID` en Vercel
- [ ] Variable `MS_CLIENT_SECRET` en Vercel
- [ ] Variable `MS_SENDER` en Vercel (opcional, default: noreply@flamencalia.com)
- [ ] Variable `MS_REPLY_TO` en Vercel (opcional, default: info@flamencalia.com)
- [ ] Test enviado con éxito via `/api/test-email`
- [ ] (Opcional) Application Access Policy configurada para restringir buzón

## Errores Comunes

| Error                                  | Causa                             | Solución                                              |
| -------------------------------------- | --------------------------------- | ----------------------------------------------------- |
| `InvalidAuthenticationToken`           | Credenciales incorrectas          | Verifica MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET |
| `Authorization_RequestDenied`          | Falta permiso o admin consent     | Añade Mail.Send (Application) + Grant admin consent   |
| `MailboxNotFound` / `ResourceNotFound` | Buzón remitente no existe         | Crea `noreply@flamencalia.com` como shared mailbox    |
| `ErrorAccessDenied`                    | Application Access Policy bloquea | Añade el buzón al grupo de la policy                  |
| Rate limited (429)                     | Muchos emails en poco tiempo      | Graph tiene límite de ~10.000 msgs/10min por buzón    |
| `AADSTS700016`                         | Client ID incorrecto              | Verifica que el App ID es correcto                    |
| `AADSTS7000215`                        | Client secret inválido            | Regenera el secret (pueden expirar)                   |

## Nota sobre Supabase Auth

Supabase Auth gestiona sus propios emails (confirmación de registro, reset de contraseña, magic links) de forma independiente a través de su servidor SMTP configurado en el Dashboard de Supabase.

**Opciones para Supabase Auth:**

1. **Usar el mailer built-in de Supabase** (3 emails/hora en plan free — limitado)
2. **Configurar SMTP externo en Supabase Dashboard** → Si consigues un SMTP funcional
3. **Desactivar emails de Supabase** y gestionar confirmaciones manualmente usando este módulo Graph

Los emails transaccionales del marketplace (ofertas, pedidos, alertas) sí se envían a través de este módulo Graph API.

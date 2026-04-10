# 🛒 Marketplace — Plataforma de Comercio Electrónico

> Plataforma marketplace lista para producción, construida con tecnología de última generación desarrollada por Gutnes Digital.

---

## 📋 Resumen Ejecutivo

**Marketplace** es una plataforma de comercio electrónico tipo marketplace (modelo C2C / B2C) que permite a vendedores publicar y gestionar sus productos, y a compradores descubrirlos, comprarlos y recibirlos — todo dentro de un único ecosistema seguro con pagos integrados.

La plataforma gestiona automáticamente el **cobro, la división de pagos y el payout a vendedores**, cobrando una comisión configurable por cada transacción.

---

## ✅ Funcionalidades Incluidas

### 🔐 Autenticación y Roles

| Característica              | Detalle                                                     |
| --------------------------- | ----------------------------------------------------------- |
| Registro e inicio de sesión | Email y contraseña con verificación                         |
| Roles de usuario            | Comprador, Vendedor, Admin, Owner                           |
| Perfiles públicos           | Nombre, avatar, biografía, teléfono                         |
| Protección de rutas         | Middleware que redirige según rol y estado de autenticación |

### 🛍️ Catálogo de Productos

| Característica           | Detalle                                                        |
| ------------------------ | -------------------------------------------------------------- |
| Publicación de productos | Título, descripción, precio, stock, hasta 10 imágenes          |
| Categorías               | Electrónica, Moda, Hogar, Deportes, Libros, Arte, Otros        |
| Estados del producto     | Borrador, Activo, Vendido, Archivado                           |
| Búsqueda avanzada        | Full-text search en español (título + descripción + categoría) |
| Página de inicio         | Productos destacados, por categoría y por oferta               |

### 💳 Pagos con Stripe

| Característica           | Detalle                                                   |
| ------------------------ | --------------------------------------------------------- |
| Onboarding de vendedores | Alta automática en Stripe Connect (Express)               |
| Checkout integrado       | Sesiones de Stripe Checkout con un clic                   |
| Comisión de plataforma   | **10% configurable** sobre cada venta                     |
| Webhooks                 | Confirmación automática de pagos y actualización de stock |
| Payout automático        | Stripe distribuye al vendedor tras descontar la comisión  |

### 📦 Gestión de Pedidos

| Característica      | Detalle                                                              |
| ------------------- | -------------------------------------------------------------------- |
| Flujo de estados    | Pendiente → Pagado → Enviado → Entregado (+ Cancelado / Reembolsado) |
| Panel del comprador | Historial de compras y seguimiento de estado                         |
| Panel del vendedor  | Lista de ventas, actualización de estado, número de seguimiento      |
| Tracking            | Soporte para número y URL de seguimiento del envío                   |

### ⭐ Sistema de Reseñas

| Característica        | Detalle                                           |
| --------------------- | ------------------------------------------------- |
| Calificación          | Sistema de 1 a 5 estrellas                        |
| Comentarios           | Texto opcional de hasta 2.000 caracteres          |
| Control de duplicados | Una reseña por pedido pagado/entregado            |
| Visibilidad pública   | Las reseñas se muestran en la página del producto |

### 📍 Gestión de Direcciones

| Característica           | Detalle                                                         |
| ------------------------ | --------------------------------------------------------------- |
| Múltiples direcciones    | Sin límite por usuario                                          |
| Dirección predeterminada | Selección de dirección por defecto para checkout rápido         |
| Campos completos         | Nombre, línea 1/2, ciudad, estado, CP, país, teléfono, etiqueta |

### 🔔 Notificaciones

| Característica    | Detalle                                                    |
| ----------------- | ---------------------------------------------------------- |
| Alertas de venta  | El vendedor recibe notificación al recibir un pedido       |
| Estado de lectura | Contador de no leídas, marcar como leída individual/masiva |
| Paginación        | 20 por página por defecto                                  |

### 🛡️ Panel de Administración

| Característica          | Detalle                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| Dashboard               | Estadísticas en tiempo real: usuarios, productos, pedidos, ingresos    |
| Gestión de usuarios     | Listado y administración de usuarios                                   |
| Gestión de productos    | Supervisión de todo el catálogo                                        |
| Gestión de pedidos      | Vista global de pedidos con filtros                                    |
| Equipo admin            | Gestión de roles Admin / Dev / Owner                                   |
| Configuración del sitio | Nombre, logo, colores, email de contacto, comisión, modo mantenimiento |

### 📄 Páginas Legales

- Política de privacidad
- Términos y condiciones
- Política de cookies

### 🔒 Seguridad

- Row Level Security (RLS) en todas las tablas
- Validación de datos con Zod en cada endpoint
- Validación de archivos por magic bytes (no solo extensión)
- Rate limiting en subidas de archivos
- Verificación de propiedad de recursos

---

## 🏗️ Stack Tecnológico

| Capa               | Tecnología                                           |
| ------------------ | ---------------------------------------------------- |
| Frontend & Backend | **Next.js 16** (App Router, React Server Components) |
| Base de datos      | **PostgreSQL** vía Supabase                          |
| Autenticación      | **Supabase Auth**                                    |
| Pagos              | **Stripe Connect** (Express)                         |
| Estilos            | **Tailwind CSS v4**                                  |
| Validación         | **Zod v4**                                           |
| Despliegue         | **Vercel** (recomendado)                             |
| Lenguaje           | **TypeScript** estricto                              |

---

## 🔀 Variantes del Proyecto

El marketplace base se puede adaptar a distintos verticales. A continuación, algunas variantes posibles:

### Variante 1 — Marketplace Generalista (actual)

Modelo tipo Wallapop / Etsy. Múltiples categorías, cualquier vendedor puede registrarse.

> **Ideal para:** plataformas de compraventa entre particulares o pequeños negocios.

### Variante 2 — Marketplace de Servicios

Adaptación para venta de servicios en lugar de productos físicos. Incluiría agenda/calendario, reservas y pagos por sesión.

> **Ideal para:** plataformas de freelancers, tutorías, consultoría.

### Variante 3 — Marketplace de Alimentación / Restaurantes

Catálogo por establecimiento, gestión de menús, pedidos con hora de recogida o entrega.

> **Ideal para:** plataformas de delivery local, mercados de proximidad.

### Variante 4 — Marketplace B2B (Mayorista)

Precios por volumen, solicitudes de presupuesto, aprobación de cuentas, catálogos privados.

> **Ideal para:** distribuidores, proveedores industriales.

### Variante 5 — Marketplace de Alquiler

Productos disponibles por período (día/semana/mes), calendario de disponibilidad, depósito de garantía.

> **Ideal para:** alquiler de equipos, herramientas, espacios.

### Variante 6 — Marketplace de Contenido Digital

Descarga inmediata tras pago, licencias, productos digitales (cursos, plantillas, ebooks).

> **Ideal para:** creadores de contenido, formaciones online, assets digitales.

---

<details>
<summary>💰 <strong>Zona de Precios (uso interno — no compartir con el cliente)</strong></summary>

### Precios Base

| Concepto                                                  | Precio      |
| --------------------------------------------------------- | ----------- |
| **Marketplace Base (tal cual está)**                      | 4.500 €     |
| Setup inicial (dominio, hosting, cuentas Stripe/Supabase) | 300 €       |
| **Total llave en mano**                                   | **4.800 €** |

### Variantes (coste adicional sobre la base)

| Variante                                              | Precio adicional | Total estimado |
| ----------------------------------------------------- | ---------------- | -------------- |
| Marketplace de Servicios (+calendario, reservas)      | +2.500 €         | 7.300 €        |
| Alimentación / Restaurantes (+menús, geolocalización) | +3.000 €         | 7.800 €        |
| B2B Mayorista (+presupuestos, catálogos privados)     | +2.800 €         | 7.600 €        |
| Marketplace de Alquiler (+calendario, depósitos)      | +2.200 €         | 7.000 €        |
| Contenido Digital (+descarga segura, licencias)       | +1.800 €         | 6.600 €        |

### Personalización y Extras

| Extra                                                 | Precio                        |
| ----------------------------------------------------- | ----------------------------- |
| Diseño UI/UX personalizado (branding completo)        | 1.200 – 2.500 €               |
| App móvil (React Native / Expo)                       | 6.000 – 12.000 €              |
| Integraciones adicionales (CRM, ERP, email marketing) | 800 – 2.000 € por integración |
| SEO avanzado y analytics                              | 600 €                         |
| Soporte multiidioma (i18n)                            | 1.000 – 1.500 €               |
| Chat en tiempo real (comprador-vendedor)              | 1.500 €                       |
| Sistema de disputas / mediación                       | 1.200 €                       |
| Programa de afiliados                                 | 1.500 €                       |

### Mantenimiento

| Plan                                                   | Precio mensual |
| ------------------------------------------------------ | -------------- |
| Básico (hosting + actualizaciones de seguridad)        | 150 €/mes      |
| Estándar (+ soporte técnico 8h, corrección de bugs)    | 350 €/mes      |
| Premium (+ nuevas funcionalidades, prioridad, SLA 24h) | 600 €/mes      |

### Notas internas

- Los precios NO incluyen IVA
- Coste de Stripe: 1,4% + 0,25 € por transacción (Europa) — lo paga la plataforma o el comprador según configuración
- Supabase Free Tier cubre hasta ~50.000 usuarios activos/mes
- Vercel Pro: ~20 $/mes para producción
- Margen objetivo: 60-70% sobre coste de desarrollo

</details>

---

## 📊 Modelo de Negocio de la Plataforma

```
  Comprador paga 100 €
        │
        ▼
  ┌─────────────┐
  │   Stripe     │ ← Cobra comisión de procesamiento (~1,4% + 0,25€)
  └─────┬───────┘
        │
        ▼
  ┌─────────────┐
  │  Plataforma  │ ← Retiene comisión configurable (por defecto 10%)
  └─────┬───────┘
        │
        ▼
  ┌─────────────┐
  │  Vendedor    │ ← Recibe el resto automáticamente vía Stripe Connect
  └─────────────┘
```

---

## 🚀 Estado Actual

- ✅ Plataforma funcional con todas las características descritas
- ✅ Base de datos con seguridad a nivel de fila (RLS)
- ✅ Integración completa con Stripe Connect
- ✅ Panel de administración operativo
- ✅ Diseño responsive y moderno
- ✅ Interfaz en español

---

_Documento preparado para reunión con cliente — 7 deAbril 2026_

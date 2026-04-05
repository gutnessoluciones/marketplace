import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hyolejmmvsizlceaslum.supabase.co",
  "sb_secret_GXff_IR_BES9Q7Yp66XZ-Q_OgMIllHk",
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function main() {
  // 1. Check if profile exists for vendor user
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", "94e9509c-debb-4645-afa0-7ddeb80f01cc")
    .single();

  if (!existingProfile) {
    console.log("Profile not found, creating it...");
    const { error: profileErr } = await supabase.from("profiles").insert({
      id: "94e9509c-debb-4645-afa0-7ddeb80f01cc",
      display_name: "Juan Vendedor",
      role: "seller",
    });
    if (profileErr) {
      console.error("Error creating profile:", profileErr.message);
      return;
    }
    console.log("Profile created");
  } else {
    console.log("Profile already exists");
  }

  const sellerId = "94e9509c-debb-4645-afa0-7ddeb80f01cc";

  // 2. Create sample products
  const products = [
    {
      seller_id: sellerId,
      title: "iPhone 15 Pro Max 256GB",
      description:
        "iPhone 15 Pro Max en perfecto estado. Color Titanio Natural. Incluye caja original, cargador y funda de silicona. Batería al 97%. Sin arañazos ni golpes.",
      price: 89900, // $899.00
      category: "electronica",
      stock: 3,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: 'MacBook Air M2 15"',
      description:
        "MacBook Air con chip M2, pantalla de 15 pulgadas, 8GB RAM, 256GB SSD. Color Medianoche. Ideal para trabajo y estudio. Garantía Apple hasta 2027.",
      price: 119900,
      category: "electronica",
      stock: 2,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Zapatillas Nike Air Max 90",
      description:
        "Zapatillas Nike Air Max 90 clásicas. Talla 42 EU. Color blanco/negro/rojo. Nuevas sin estrenar, en caja original.",
      price: 12990,
      category: "ropa",
      stock: 5,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Cámara Sony Alpha A7 III",
      description:
        "Cámara mirrorless Sony A7 III con sensor full-frame de 24.2MP. Incluye objetivo 28-70mm f/3.5-5.6. Perfecta para fotografía y vídeo 4K.",
      price: 149900,
      category: "electronica",
      stock: 1,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Sudadera Hoodie Premium Unisex",
      description:
        "Sudadera con capucha de algodón orgánico 100%. Corte oversize. Disponible en negro. Talla M/L. Interior afelpado, perfecta para el invierno.",
      price: 4590,
      category: "ropa",
      stock: 12,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Auriculares Sony WH-1000XM5",
      description:
        "Auriculares inalámbricos con cancelación de ruido líder en la industria. 30 horas de batería. Sonido Hi-Res. Color negro. Como nuevos.",
      price: 29900,
      category: "electronica",
      stock: 4,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Lámpara de Mesa LED Moderna",
      description:
        "Lámpara de escritorio LED con brazo articulado. 3 modos de luz (cálida, neutra, fría) y 10 niveles de brillo. Carga USB integrada. Diseño minimalista.",
      price: 3490,
      category: "hogar",
      stock: 8,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Mochila Viaje 40L Impermeable",
      description:
        'Mochila de viaje expandible de 40L. Material impermeable, compartimento para portátil de 17". Apertura tipo maleta. Ideal como equipaje de mano.',
      price: 5990,
      category: "deportes",
      stock: 6,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Teclado Mecánico RGB Gaming",
      description:
        "Teclado mecánico con switches Cherry MX Red. Retroiluminación RGB personalizable. Layout español. Estructura de aluminio. Cable USB-C desmontable.",
      price: 7990,
      category: "electronica",
      stock: 3,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Set de Plantas Artificiales Decorativas",
      description:
        "Set de 3 plantas artificiales en macetas de cerámica blanca. Incluye: suculenta, helecho y eucalipto. Perfectas para decoración de interiores.",
      price: 2490,
      category: "hogar",
      stock: 15,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Balón de Fútbol Adidas Pro",
      description:
        "Balón oficial de fútbol Adidas. Cosido a mano. Talla 5 reglamentaria. Usado en competiciones nacionales. Incluye inflador.",
      price: 3990,
      category: "deportes",
      stock: 7,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: 'Libro "Sapiens" - Yuval Noah Harari',
      description:
        "Edición en español, tapa blanda. Bestseller mundial sobre la historia de la humanidad. Estado: como nuevo, sin subrayar.",
      price: 1590,
      category: "libros",
      stock: 4,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      ],
    },
  ];

  const { data, error } = await supabase
    .from("products")
    .insert(products)
    .select("id, title");

  if (error) {
    console.error("Error creating products:", error.message);
    return;
  }

  console.log(`Created ${data.length} products:`);
  data.forEach((p) => console.log(`  - ${p.title} (${p.id})`));
}

main();

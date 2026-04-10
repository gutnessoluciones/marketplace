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
      display_name: "Flamencalia Sevilla",
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

  // 1b. Delete old products from this seller
  console.log("Deleting old products...");
  const { error: delErr } = await supabase
    .from("products")
    .delete()
    .eq("seller_id", sellerId);
  if (delErr) {
    console.error("Error deleting old products:", delErr.message);
  } else {
    console.log("Old products deleted");
  }

  // Also update display name
  await supabase
    .from("profiles")
    .update({ display_name: "Flamencalia Sevilla" })
    .eq("id", sellerId);

  // 2. Create sample products
  const products = [
    {
      seller_id: sellerId,
      title: "Traje de Flamenca Rojo Lunares Blancos",
      description:
        "Precioso traje de flamenca en rojo con lunares blancos. Talla 38. Confección artesanal sevillana con 3 volantes en la falda y mangas con encaje. Usado solo una feria, en perfecto estado. Incluye percha especial.",
      price: 35000,
      category: "feria",
      stock: 1,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1565036458-51e0a04b1e13?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Mantón de Manila Bordado a Mano",
      description:
        "Mantón de Manila artesanal con bordado de flores y flecos largos. Color negro con rosas rojas. 140x140 cm sin flecos. Pieza única, ideal para feria y eventos. Bordado a mano en seda natural.",
      price: 28000,
      category: "complementos",
      stock: 2,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Pendientes Flamenca Coral y Oro",
      description:
        "Pendientes largos de coral natural engarzado en oro de ley. Diseño clásico de lágrima con racimo. Perfectos para complementar tu traje de flamenca. Largo total 7 cm.",
      price: 8500,
      category: "complementos",
      stock: 4,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Traje de Flamenca Verde Agua Canastero",
      description:
        "Traje de flamenca tipo canastero en verde agua con encaje beige. Talla 40. Diseño exclusivo, solo se hicieron 5 unidades. Cuerpo entallado con escote barco. Perfecto para el Camino o Romería.",
      price: 42000,
      category: "camino",
      stock: 1,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Flores de Flamenca - Ramillete Rosas Rojas",
      description:
        "Ramillete de 3 rosas rojas con capullos y hojas verdes. Tamaño grande, ideal para recogido alto. Fabricación artesanal en tela y organza. Se puede adaptar con peineta o pinza.",
      price: 3500,
      category: "complementos",
      stock: 8,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Zapatos de Flamenca Profesional",
      description:
        "Zapatos de baile flamenco profesional con clavos. Piel natural color negro. Talla 37. Tacón de 6 cm reforzado. Suela cosida. Marca reconocida en el mundo del flamenco.",
      price: 12000,
      category: "zapatos",
      stock: 3,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Abanico Pintado a Mano - Diseño Floral",
      description:
        "Abanico artesanal de madera de peral con país de tela pintado a mano. Motivos florales en tonos rojos y dorados. 23 cm cerrado. Una pieza de artesanía andaluza auténtica.",
      price: 4500,
      category: "complementos",
      stock: 5,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Traje Corto de Caballero - Feria",
      description:
        "Traje corto de caballero para feria en gris marengo. Talla 50. Chaquetilla con alamares y pantalón de talle alto. Confección artesanal. Incluye fajín burdeos. Usado una sola vez.",
      price: 38000,
      category: "equitacion",
      stock: 1,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Peinecillo Dorado con Strass",
      description:
        "Peinecillo de flamenca en metal dorado con cristales de strass. Diseño de abanico. 8 cm de ancho. Perfecto para sujetar flores o mantilla. Brillo espectacular.",
      price: 2800,
      category: "complementos",
      stock: 10,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Vestido Flamenca Infantil Rosa",
      description:
        "Vestido de flamenca para niña de 4-5 años. Color rosa con topos blancos. 2 volantes. Incluye flor a juego para el pelo. Perfecto para que las pequeñas disfruten de la feria.",
      price: 6500,
      category: "infantil",
      stock: 3,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
      ],
    },
    {
      seller_id: sellerId,
      title: "Sombrero Cordobés Negro",
      description:
        "Sombrero cordobés de fieltro negro. Talla 58. Ala ancha y copa baja. Fabricación nacional. Perfecto para feria, romería o eventos ecuestres. Estado impecable.",
      price: 7500,
      category: "complementos",
      stock: 2,
      status: "active",
      images: [
        "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=800&q=80",
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

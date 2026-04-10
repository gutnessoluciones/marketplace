import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductsService } from "@/services/products.service";
import { ReviewsService } from "@/services/reviews.service";
import { formatPrice } from "@/lib/utils";
import { BuyButton } from "@/components/products/buy-button";
import { ProductGallery } from "@/components/products/product-gallery";
import { ViewTracker } from "@/components/products/view-tracker";
import { Icon } from "@/components/icons";
import { UserNav } from "@/components/layout/user-nav";
import { Footer } from "@/components/layout/footer";

const COLOR_HEX: Record<string, string> = {
  blanco: "#FFFFFF",
  negro: "#1A1A1A",
  rojo: "#C8102E",
  rosa: "#F4A6C0",
  fucsia: "#D6006E",
  naranja: "#F28C28",
  amarillo: "#F5D100",
  verde: "#2E8B57",
  azul: "#2563EB",
  morado: "#7C3AED",
  burdeos: "#722F37",
  dorado: "#D4A843",
  plateado: "#C0C0C0",
  beige: "#E8D5B7",
  marron: "#8B5E34",
  multicolor: "#ccc",
};

const CONDITION_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  "como-nuevo": "Como nuevo",
  bueno: "Buen estado",
  aceptable: "Aceptable",
};

const CATEGORY_LABELS: Record<string, string> = {
  feria: "Feria",
  camino: "Camino",
  "complementos-flamencos": "Complementos Flamencos",
  "invitada-flamenca": "Invitada Flamenca",
  "moda-infantil": "Moda Infantil",
  equitacion: "Equitación",
  zapatos: "Zapatos",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const service = new ProductsService(supabase);

  try {
    const product = await service.getById(id);
    const title = `${product.title} - Flamencalia`;
    const description = product.description
      ? product.description.slice(0, 160)
      : `Compra ${product.title} por ${formatPrice(product.price)} en Flamencalia`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: product.images?.length > 0 ? [product.images[0]] : [],
        type: "website",
        siteName: "Flamencalia",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: product.images?.length > 0 ? [product.images[0]] : [],
      },
    };
  } catch {
    return { title: "Producto no encontrado - Flamencalia" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const productsService = new ProductsService(supabase);
  const reviewsService = new ReviewsService(supabase);

  let product;
  try {
    product = await productsService.getById(id);
  } catch {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Icon name="search" className="w-8 h-8 text-neutral-300" />
          </div>
          <h2 className="text-lg font-semibold mb-2 text-neutral-700">
            Producto no encontrado
          </h2>
          <Link
            href="/products"
            className="text-sm text-flamencalia-albero hover:underline font-medium"
          >
            ← Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  const reviews = await reviewsService.listByProduct(id);

  const avgRating =
    reviews.data.length > 0
      ? (
          reviews.data.reduce((sum, r) => sum + r.rating, 0) /
          reviews.data.length
        ).toFixed(1)
      : null;

  // Seller stats
  const { count: sellerProductCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", product.seller_id)
    .eq("status", "active");

  const { data: sellerReviewsRaw } = await supabase
    .from("reviews")
    .select("rating")
    .eq("seller_id", product.seller_id);

  const sellerReviews = sellerReviewsRaw ?? [];
  const sellerAvgRating =
    sellerReviews.length > 0
      ? (
          sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length
        ).toFixed(1)
      : null;

  // Related products (same category, exclude current)
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(id, display_name, avatar_url)")
    .eq("status", "active")
    .eq("category", product.category)
    .neq("id", product.id)
    .order("views_count", { ascending: false })
    .limit(4);

  return (
    <div className="min-h-screen bg-neutral-50">
      <ViewTracker productId={product.id} />

      {/* Header */}
      <header className="bg-flamencalia-black sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/cliente/marca-flamencalia.svg"
              alt="FLAMENCALIA"
              width={140}
              height={28}
              className="h-5 w-auto object-contain invert"
            />
            <Image
              src="/cliente/Abanico.svg"
              alt=""
              width={28}
              height={28}
              className="w-7 h-7"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="text-sm font-medium text-flamencalia-albero hover:text-white transition-colors"
            >
              Explorar
            </Link>
            <UserNav variant="dark" />
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Link href="/" className="hover:text-neutral-600 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link
              href="/products"
              className="hover:text-neutral-600 transition-colors"
            >
              Productos
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  href={`/products?category=${product.category}`}
                  className="hover:text-neutral-600 transition-colors"
                >
                  {CATEGORY_LABELS[product.category] ?? product.category}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-neutral-600 font-medium truncate max-w-48">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left: Gallery ── */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images ?? []}
              title={product.title}
            />
          </div>

          {/* ── Right: Product info ── */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 space-y-6">
              {/* Main info card */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                {/* Category + condition */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {product.category && (
                    <Link
                      href={`/products?category=${product.category}`}
                      className="text-xs font-medium text-flamencalia-albero bg-flamencalia-albero/10 px-2.5 py-1 rounded-full hover:bg-flamencalia-albero/15 transition-colors"
                    >
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </Link>
                  )}
                  {product.condition && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                      <Icon name="check" className="w-3 h-3" />
                      {CONDITION_LABELS[product.condition] ?? product.condition}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 leading-tight">
                  {product.title}
                </h1>

                {/* Rating + views */}
                <div className="flex items-center gap-3 mt-3">
                  {avgRating && (
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon
                            key={star}
                            name={
                              star <= Math.round(Number(avgRating))
                                ? "starFilled"
                                : "star"
                            }
                            className={`w-4 h-4 ${star <= Math.round(Number(avgRating)) ? "text-amber-400" : "text-neutral-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-neutral-700 ml-1">
                        {avgRating}
                      </span>
                      <span className="text-xs text-neutral-400">
                        ({reviews.total})
                      </span>
                    </div>
                  )}
                  {product.views_count > 0 && (
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Icon name="eye" className="w-3.5 h-3.5" />
                      {product.views_count} visitas
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-5 pt-5 border-t border-neutral-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl lg:text-4xl font-extrabold text-flamencalia-black">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 mt-2 text-xs font-medium ${
                      product.stock > 0
                        ? "text-flamencalia-albero"
                        : "text-neutral-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? "bg-flamencalia-albero" : "bg-neutral-400"}`}
                    />
                    {product.stock > 0
                      ? `${product.stock} disponible${product.stock > 1 ? "s" : ""}`
                      : "Agotado"}
                  </span>
                </div>

                {/* Attributes */}
                {(product.size ||
                  product.color ||
                  product.brand ||
                  product.material) && (
                  <div className="mt-5 pt-5 border-t border-neutral-100">
                    <div className="grid grid-cols-2 gap-3">
                      {product.color && (
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-6 h-6 rounded-full border border-neutral-200 shadow-sm shrink-0"
                            style={{
                              background: COLOR_HEX[product.color] ?? "#ccc",
                            }}
                          />
                          <div>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                              Color
                            </p>
                            <p className="text-sm font-medium text-neutral-700 capitalize">
                              {product.color === "marron"
                                ? "Marrón"
                                : product.color}
                            </p>
                          </div>
                        </div>
                      )}
                      {product.size && (
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                            Talla
                          </p>
                          <p className="text-sm font-medium text-neutral-700">
                            {product.size === "unica" ? "Única" : product.size}
                          </p>
                        </div>
                      )}
                      {product.brand && (
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                            Marca
                          </p>
                          <p className="text-sm font-medium text-neutral-700">
                            {product.brand}
                          </p>
                        </div>
                      )}
                      {product.material && (
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                            Material
                          </p>
                          <p className="text-sm font-medium text-neutral-700 capitalize">
                            {product.material}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Buy button */}
                <div className="mt-6 pt-5 border-t border-neutral-100">
                  <BuyButton
                    productId={product.id}
                    inStock={product.stock > 0}
                  />
                </div>
              </div>

              {/* Seller card */}
              {product.seller && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                  <div className="flex items-start gap-3">
                    <Link
                      href={`/sellers/${product.seller.id}`}
                      className="shrink-0"
                    >
                      <div className="w-12 h-12 rounded-full bg-neutral-100 overflow-hidden ring-2 ring-neutral-100">
                        {product.seller.avatar_url ? (
                          <img
                            src={product.seller.avatar_url}
                            alt={product.seller.display_name ?? ""}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon
                              name="user"
                              className="w-6 h-6 text-neutral-400"
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/sellers/${product.seller.id}`}
                        className="font-semibold text-sm text-neutral-800 hover:text-flamencalia-albero transition-colors"
                      >
                        {product.seller.display_name ?? "Vendedor"}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                        {sellerAvgRating && (
                          <span className="flex items-center gap-0.5">
                            <Icon
                              name="starFilled"
                              className="w-3 h-3 text-amber-400"
                            />
                            {sellerAvgRating} ({sellerReviews.length})
                          </span>
                        )}
                        <span>{sellerProductCount ?? 0} artículos</span>
                      </div>
                    </div>
                    <Link
                      href={`/sellers/${product.seller.id}`}
                      className="text-xs font-medium text-flamencalia-albero border border-flamencalia-albero/20 px-3 py-1.5 rounded-full hover:bg-flamencalia-albero/5 transition-colors shrink-0"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-10 bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
            <h2 className="text-base font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Icon name="receipt" className="w-4 h-4 text-neutral-400" />
              Descripción
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Reviews section */}
        <div className="mt-8 bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-neutral-800 flex items-center gap-2">
              <Icon name="star" className="w-4 h-4 text-neutral-400" />
              Reseñas
              {reviews.total ? (
                <span className="text-xs font-normal text-neutral-400 ml-1">
                  ({reviews.total})
                </span>
              ) : null}
            </h2>
            {avgRating && (
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name={
                        star <= Math.round(Number(avgRating))
                          ? "starFilled"
                          : "star"
                      }
                      className={`w-3.5 h-3.5 ${star <= Math.round(Number(avgRating)) ? "text-amber-400" : "text-neutral-200"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-amber-700">
                  {avgRating}
                </span>
              </div>
            )}
          </div>

          {reviews.data.length > 0 ? (
            <div className="space-y-4">
              {reviews.data.map((review) => (
                <div
                  key={review.id}
                  className="flex gap-3 pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-100 overflow-hidden shrink-0">
                    {review.buyer?.avatar_url ? (
                      <img
                        src={review.buyer.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon
                          name="user"
                          className="w-4 h-4 text-neutral-400"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm text-neutral-700">
                        {review.buyer?.display_name ?? "Comprador"}
                      </p>
                      <div className="flex shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon
                            key={star}
                            name={star <= review.rating ? "starFilled" : "star"}
                            className={`w-3.5 h-3.5 ${star <= review.rating ? "text-amber-400" : "text-neutral-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-neutral-500 leading-relaxed mt-1">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon
                name="message"
                className="w-8 h-8 text-neutral-200 mx-auto mb-2"
              />
              <p className="text-sm text-neutral-400">
                Aún no hay reseñas para este producto.
              </p>
            </div>
          )}
        </div>

        {/* Related products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-base font-bold text-neutral-800 mb-5 flex items-center gap-2">
              <Icon name="sparkle" className="w-4 h-4 text-neutral-400" />
              Productos similares
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.map((rp) => {
                const rpTyped = rp as import("@/types").Product;
                return (
                  <Link
                    key={rpTyped.id}
                    href={`/products/${rpTyped.id}`}
                    className="group bg-white rounded-xl overflow-hidden border border-neutral-200 hover:shadow-md transition-all"
                  >
                    <div className="aspect-3/4 bg-neutral-100 overflow-hidden">
                      {rpTyped.images?.length > 0 ? (
                        <img
                          src={rpTyped.images[0]}
                          alt={rpTyped.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-200">
                          <Icon name="dress" className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-neutral-800">
                        {formatPrice(rpTyped.price)}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                        {rpTyped.title}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

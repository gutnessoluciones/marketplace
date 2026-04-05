import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductsService } from "@/services/products.service";
import { ReviewsService } from "@/services/reviews.service";
import { formatPrice } from "@/lib/utils";
import { BuyButton } from "@/components/products/buy-button";
import { Icon } from "@/components/icons";
import { UserNav } from "@/components/layout/user-nav";
import { Footer } from "@/components/layout/footer";

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
    const title = `${product.title} - GutnesPlace`;
    const description = product.description
      ? product.description.slice(0, 160)
      : `Compra ${product.title} por ${formatPrice(product.price)} en GutnesPlace`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: product.images?.length > 0 ? [product.images[0]] : [],
        type: "website",
        siteName: "GutnesPlace",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: product.images?.length > 0 ? [product.images[0]] : [],
      },
    };
  } catch {
    return { title: "Producto no encontrado - GutnesPlace" };
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
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl text-slate-300">
              <Icon name="search" className="w-8 h-8" />
            </span>
          </div>
          <h2 className="text-lg font-semibold mb-2">Producto no encontrado</h2>
          <Link
            href="/products"
            className="text-sm text-emerald-600 hover:underline font-medium"
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-950 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-bold tracking-tight"
          >
            <Image
              src="/gutnes-logo.png"
              alt="GutnesPlace"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="hidden sm:inline">GutnesPlace</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="text-sm font-medium text-indigo-200 hover:text-white transition-colors"
            >
              Explorar
            </Link>
            <UserNav variant="dark" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors mb-6"
        >
          ← Volver a productos
        </Link>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="bg-gray-100 aspect-square flex items-center justify-center">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">Sin imagen</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-8 lg:p-10 flex flex-col">
              {product.category && (
                <span className="inline-flex items-center self-start bg-gray-100 text-xs font-medium px-3 py-1 rounded-full capitalize mb-4">
                  {product.category}
                </span>
              )}

              <h1 className="text-2xl lg:text-3xl font-bold">
                {product.title}
              </h1>

              <p className="text-3xl lg:text-4xl font-bold mt-4 text-emerald-600">
                {formatPrice(product.price)}
              </p>

              {product.seller && (
                <p className="text-sm text-gray-500 mt-3">
                  Vendido por{" "}
                  <span className="font-medium text-gray-700">
                    {product.seller.display_name}
                  </span>
                </p>
              )}

              <div className="flex items-center gap-4 mt-4">
                {avgRating && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500">
                      {"★".repeat(Math.round(Number(avgRating)))}
                    </span>
                    <span className="text-sm font-medium">{avgRating}</span>
                    <span className="text-sm text-gray-400">
                      ({reviews.total})
                    </span>
                  </div>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 text-sm ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`}
                  />
                  {product.stock > 0
                    ? `${product.stock} en stock`
                    : "Sin stock"}
                </span>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 mt-6 leading-relaxed whitespace-pre-line border-t pt-6">
                  {product.description}
                </p>
              )}

              <div className="mt-auto pt-6">
                <BuyButton productId={product.id} inStock={product.stock > 0} />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-6">
            Reseñas {reviews.total ? `(${reviews.total})` : ""}
          </h2>
          {reviews.data.length > 0 ? (
            <div className="grid gap-4">
              {reviews.data.map((review) => (
                <div key={review.id} className="bg-white border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">
                      {review.buyer?.display_name ?? "Comprador"}
                    </p>
                    <p className="text-amber-500 text-sm">
                      {"★".repeat(review.rating)}
                      <span className="text-gray-200">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </p>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-xl p-8 text-center">
              <p className="text-sm text-gray-400">
                Aún no hay reseñas para este producto.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

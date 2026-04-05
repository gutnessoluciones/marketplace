import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductsService } from "@/services/products.service";
import { ReviewsService } from "@/services/reviews.service";
import { formatPrice } from "@/lib/utils";
import { BuyButton } from "@/components/products/buy-button";

interface PageProps {
  params: Promise<{ id: string }>;
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
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Producto no encontrado.</p>
        <Link href="/products" className="underline text-sm mt-2 inline-block">
          Volver a productos
        </Link>
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/products"
        className="text-sm text-gray-500 hover:text-black transition-colors mb-4 inline-block"
      >
        &larr; Volver a productos
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image placeholder */}
        <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
          {product.images?.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="object-cover rounded-lg w-full h-full"
            />
          ) : (
            <span className="text-gray-400 text-sm">Sin imagen</span>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="text-3xl font-bold mt-2">
            {formatPrice(product.price)}
          </p>

          {product.seller && (
            <p className="text-sm text-gray-500 mt-2">
              por {product.seller.display_name}
            </p>
          )}

          {avgRating && (
            <p className="text-sm text-gray-600 mt-1">
              {avgRating} / 5 ({reviews.total} reseñas)
            </p>
          )}

          <p className="text-sm text-gray-500 mt-1">
            {product.stock > 0 ? `${product.stock} en stock` : "Sin stock"}
          </p>

          {product.description && (
            <p className="text-sm text-gray-700 mt-4 whitespace-pre-line">
              {product.description}
            </p>
          )}

          <div className="mt-6">
            <BuyButton productId={product.id} inStock={product.stock > 0} />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">
          Reseñas ({reviews.total ?? 0})
        </h2>
        {reviews.data.length > 0 ? (
          <div className="space-y-4">
            {reviews.data.map((review) => (
              <div key={review.id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {review.buyer?.display_name ?? "Comprador"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aún no hay reseñas.</p>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductsService } from "@/services/products.service";
import { ProductCard } from "@/components/products/product-card";

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { page: pageStr, category } = await searchParams;
  const page = Number(pageStr) || 1;

  const supabase = await createClient();
  const service = new ProductsService(supabase);
  const result = await service.list(page, 20, category);

  const totalPages = Math.ceil((result.total ?? 0) / result.limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-black transition-colors"
        >
          &larr; Inicio
        </Link>
      </div>

      {result.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {result.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`/products?page=${page - 1}${category ? `&category=${category}` : ""}`}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </Link>
              )}
              <span className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/products?page=${page + 1}${category ? `&category=${category}` : ""}`}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Siguiente
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500">No se encontraron productos.</p>
      )}
    </div>
  );
}

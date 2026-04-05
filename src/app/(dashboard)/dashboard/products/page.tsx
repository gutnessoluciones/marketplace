import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ProductsService } from "@/services/products.service";

export default async function MyProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = new ProductsService(supabase);
  const products = await service.listBySeller(user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link
          href="/dashboard/products/new"
          className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800"
        >
          Add Product
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="border rounded-lg divide-y">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="text-sm font-medium">{product.title}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {product.status} &middot; Stock: {product.stock}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium">
                  {formatPrice(product.price)}
                </p>
                <Link
                  href={`/dashboard/products/${product.id}/edit`}
                  className="text-xs underline text-gray-600"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No products yet.{" "}
          <Link href="/dashboard/products/new" className="underline">
            Create your first product
          </Link>
        </p>
      )}
    </div>
  );
}

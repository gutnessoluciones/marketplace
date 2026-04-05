import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(display_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {products?.length ?? 0} productos en la plataforma
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                Producto
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                Vendedor
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                Precio
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                Stock
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                      {product.images?.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Icon name="package" className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {product.category ?? "Sin categoría"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">
                  {product.seller?.display_name ?? "—"}
                </td>
                <td className="px-5 py-3 text-sm font-medium text-slate-700">
                  {formatPrice(product.price)}
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">
                  {product.stock}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      product.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : product.status === "draft"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {product.status === "active"
                      ? "Activo"
                      : product.status === "draft"
                        ? "Borrador"
                        : product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

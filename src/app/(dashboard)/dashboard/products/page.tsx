import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ProductsService } from "@/services/products.service";
import { Icon } from "@/components/icons";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "Activo", color: "bg-emerald-50 text-emerald-700" },
  draft: { label: "Borrador", color: "bg-slate-100 text-slate-600" },
  sold: { label: "Vendido", color: "bg-blue-50 text-blue-700" },
  archived: { label: "Archivado", color: "bg-red-50 text-red-600" },
};

export default async function MyProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = new ProductsService(supabase);
  const products = await service.listBySeller(user.id);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis Productos</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {products.length} productos en total
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="bg-linear-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Añadir Producto
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">
          {products.map((product) => {
            const status = STATUS_MAP[product.status] ?? {
              label: product.status,
              color: "bg-slate-100 text-slate-600",
            };
            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                    {product.images?.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Icon name="package" className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {product.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        Stock: {product.stock}
                      </span>
                      {product.category && (
                        <span className="text-xs text-slate-400">
                          · {product.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <p className="text-sm font-bold text-indigo-700">
                    {formatPrice(product.price)}
                  </p>
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center">
          <span className="text-5xl block mb-4 text-slate-300">
            <Icon name="package" className="w-12 h-12 mx-auto" />
          </span>
          <h3 className="font-semibold text-slate-700 mb-1">
            No tienes productos aún
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Crea tu primer producto y empieza a vender.
          </p>
          <Link
            href="/dashboard/products/new"
            className="inline-flex bg-linear-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all"
          >
            Crear mi primer producto
          </Link>
        </div>
      )}
    </div>
  );
}

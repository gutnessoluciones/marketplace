import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProductsService } from "@/services/products.service";
import { EditProductForm } from "@/components/products/edit-product-form";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = new ProductsService(supabase);

  try {
    const product = await service.getById(id);
    if (product.seller_id !== user.id) redirect("/dashboard/products");
    return (
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard/products"
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <svg
              className="w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Editar Producto
            </h1>
            <p className="text-sm text-slate-400">{product.title}</p>
          </div>
        </div>
        <EditProductForm product={product} />
      </div>
    );
  } catch {
    redirect("/dashboard/products");
  }
}

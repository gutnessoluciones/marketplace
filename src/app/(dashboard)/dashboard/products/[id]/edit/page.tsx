import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProductsService } from "@/services/products.service";
import { EditProductForm } from "@/components/products/edit-product-form";

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
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        <EditProductForm product={product} />
      </div>
    );
  } catch {
    redirect("/dashboard/products");
  }
}

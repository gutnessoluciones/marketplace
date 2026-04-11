import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FavoritesService } from "@/services/favorites.service";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { FavoriteButton } from "@/components/social/favorite-button";

export const metadata = { title: "Mis Favoritos — Flamencalia" };

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = new FavoritesService(supabase);
  const { data: favorites, total } = await service.list(user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-flamencalia-black">
          Mis Favoritos
          {total ? (
            <span className="text-sm font-normal text-flamencalia-black/40 ml-2">
              ({total})
            </span>
          ) : null}
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-flamencalia-albero-pale/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="heart" className="w-8 h-8 text-flamencalia-albero" />
          </div>
          <p className="text-flamencalia-black/50 text-sm">
            No tienes productos favoritos aún
          </p>
          <Link
            href="/products"
            className="text-sm text-flamencalia-albero hover:underline font-medium mt-2 inline-block"
          >
            Explorar productos →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {favorites.map((fav) => {
            const product = Array.isArray(fav.product)
              ? fav.product[0]
              : fav.product;
            if (!product) return null;

            const seller = Array.isArray(product.seller)
              ? product.seller[0]
              : product.seller;

            return (
              <div key={fav.id} className="relative group">
                <Link
                  href={`/products/${product.id}`}
                  className="block bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  <div className="aspect-3/4 bg-flamencalia-cream relative overflow-hidden">
                    {product.images?.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-flamencalia-albero/30">
                        <Icon name="dress" className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-base font-bold text-flamencalia-black">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                      {product.title}
                    </p>
                    {seller && (
                      <p className="text-[11px] text-neutral-400 mt-1 truncate">
                        {seller.display_name}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="absolute top-2 right-2 z-10">
                  <FavoriteButton
                    productId={product.id}
                    initialFavorited={true}
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

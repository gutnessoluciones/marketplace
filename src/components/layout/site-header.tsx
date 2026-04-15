import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { UserNav } from "@/components/layout/user-nav";
import { PublicMobileNav } from "@/components/layout/public-mobile-nav";

const CATEGORIES = [
  { slug: "feria", label: "Feria", icon: "fan" },
  { slug: "camino", label: "Camino", icon: "flower" },
  {
    slug: "complementos-flamencos",
    label: "Complementos",
    icon: "earring",
    subcategories: [
      { slug: "mantones", label: "Mantones" },
      { slug: "flores", label: "Flores" },
      { slug: "pendientes", label: "Pendientes" },
      { slug: "broches-mantones", label: "Broches para mantones" },
      { slug: "sombreros", label: "Sombreros" },
      { slug: "panuelos", label: "Pañuelos" },
    ],
  },
  { slug: "invitada-flamenca", label: "Invitada Flamenca", icon: "dress" },
  { slug: "moda-infantil", label: "Moda Infantil", icon: "child" },
  { slug: "equitacion", label: "Equitación", icon: "horseshoe" },
  { slug: "zapatos", label: "Zapatos", icon: "shoe" },
];

interface SiteHeaderProps {
  activeCategory?: string;
  defaultSearch?: string;
}

export function SiteHeader({ activeCategory, defaultSearch }: SiteHeaderProps) {
  return (
    <header className="bg-flamencalia-white sticky top-0 z-30 shadow-sm">
      {/* Top decorative toldo */}
      <div className="h-1.5 toldo-rayas" />

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger menu — left of logo */}
          <PublicMobileNav />
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Image
              src="/cliente/marca-flamencalia.svg"
              alt="FLAMENCALIA"
              width={220}
              height={44}
              className="h-7 sm:h-10 w-auto object-contain"
            />
            <Image
              src="/cliente/Abanico.svg"
              alt=""
              width={48}
              height={48}
              className="w-8 h-8 sm:w-12 sm:h-12"
            />
          </Link>
        </div>

        {/* Search bar */}
        <form
          action="/products"
          method="GET"
          className="hidden sm:block flex-1 max-w-xl"
        >
          {activeCategory && (
            <input type="hidden" name="category" value={activeCategory} />
          )}
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-flamencalia-albero"
            />
            <input
              type="text"
              name="q"
              defaultValue={defaultSearch}
              placeholder="Buscar vestidos, mantones, complementos..."
              className="w-full bg-flamencalia-cream border border-flamencalia-albero-pale rounded-full pl-11 pr-5 py-2.5 text-sm text-flamencalia-black placeholder-neutral-400 hover:border-flamencalia-albero focus:border-flamencalia-albero focus:outline-none focus:ring-2 focus:ring-flamencalia-albero/20 transition-all"
            />
          </div>
        </form>

        <UserNav variant="light" />
      </nav>

      {/* Categories bar */}
      {/* Categories bar — hidden on mobile (hamburger menu covers it) */}
      <div className="hidden sm:block border-t border-flamencalia-albero-pale/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-2">
          <Link
            href="/products"
            className={`text-xs font-serif font-semibold uppercase tracking-wide px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              !activeCategory
                ? "text-flamencalia-white bg-flamencalia-black"
                : "text-flamencalia-black/70 hover:bg-flamencalia-albero/10 hover:text-flamencalia-albero"
            }`}
          >
            Todo
          </Link>
          {CATEGORIES.map((cat) =>
            "subcategories" in cat && cat.subcategories ? (
              <div key={cat.slug} className="relative group">
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={`text-xs font-serif font-medium uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                    activeCategory === cat.slug
                      ? "text-flamencalia-white bg-flamencalia-black"
                      : "text-flamencalia-black/70 hover:bg-flamencalia-albero/10 hover:text-flamencalia-albero"
                  }`}
                >
                  {cat.label}
                </Link>
                <div className="absolute top-full left-0 pt-1 hidden group-hover:block z-50">
                  <div className="bg-white rounded-xl shadow-lg border border-neutral-100 py-2 min-w-[180px]">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/products?category=${cat.slug}&subcategory=${sub.slug}`}
                        className="block px-4 py-2 text-xs font-medium text-flamencalia-black/70 hover:bg-flamencalia-albero/10 hover:text-flamencalia-red transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className={`text-xs font-serif font-medium uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                  activeCategory === cat.slug
                    ? "text-flamencalia-white bg-flamencalia-black"
                    : "text-flamencalia-black/70 hover:bg-flamencalia-albero/10 hover:text-flamencalia-albero"
                }`}
              >
                {cat.label}
              </Link>
            ),
          )}

          {/* Separador */}
          <span className="w-px h-4 bg-flamencalia-albero-pale/50 mx-1" />

          <Link
            href="/ferias"
            className="text-xs font-serif font-medium uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-flamencalia-albero/10 text-flamencalia-black/70 hover:text-flamencalia-albero transition-colors whitespace-nowrap"
          >
            Ferias
          </Link>
          <Link
            href="/blog"
            className="text-xs font-serif font-medium uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-flamencalia-albero/10 text-flamencalia-black/70 hover:text-flamencalia-albero transition-colors whitespace-nowrap"
          >
            Blog
          </Link>
          <Link
            href="/lookbook"
            className="text-xs font-serif font-medium uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-flamencalia-albero/10 text-flamencalia-black/70 hover:text-flamencalia-albero transition-colors whitespace-nowrap"
          >
            Inspírate
          </Link>
          <Link
            href="/about"
            className="text-flamencalia-albero text-xs font-serif font-medium uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-flamencalia-albero/10 hover:text-flamencalia-albero transition-colors whitespace-nowrap ml-auto"
          >
            Quiénes Somos
          </Link>
        </div>
      </div>
    </header>
  );
}

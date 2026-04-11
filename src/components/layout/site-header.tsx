import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { UserNav } from "@/components/layout/user-nav";

const CATEGORIES = [
  { slug: "feria", label: "Feria", icon: "fan" },
  { slug: "camino", label: "Camino", icon: "flower" },
  { slug: "complementos-flamencos", label: "Complementos", icon: "earring" },
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

        {/* Mobile search link */}
        <Link
          href="/products"
          className="sm:hidden p-2 text-flamencalia-black/60 hover:text-flamencalia-albero"
        >
          <Icon name="search" className="w-5 h-5" />
        </Link>

        <UserNav variant="light" />
      </nav>

      {/* Categories bar */}
      <div className="border-t border-flamencalia-albero-pale/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
          <Link
            href="/products"
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              !activeCategory
                ? "text-flamencalia-white bg-flamencalia-black"
                : "text-flamencalia-black/70 hover:bg-flamencalia-albero/10 hover:text-flamencalia-albero"
            }`}
          >
            Todo
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === cat.slug
                  ? "text-flamencalia-white bg-flamencalia-black"
                  : "text-flamencalia-black/70 hover:bg-flamencalia-albero/10 hover:text-flamencalia-albero"
              }`}
            >
              <Icon name={cat.icon} className="w-3.5 h-3.5" /> {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

import Image from "next/image";

export function BannerCarousel() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src="/coleccion/banner.jpeg"
        alt="Flamencalia — Traje de flamenca rojo"
        fill
        className="object-cover"
        sizes="100vw"
        priority
        quality={80}
      />

      {/* Overlay degradado sutil */}
      <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
    </div>
  );
}

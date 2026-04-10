"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const BANNER_IMAGES = [
  "/coleccion/banner.jpeg",
  "/coleccion/banner2.jpeg",
  "/coleccion/banner3.jpeg",
  "/coleccion/banner4.jpeg",
  "/coleccion/banner5.jpeg",
];

export function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {BANNER_IMAGES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`Flamencalia colección ${i + 1}`}
          fill
          className={`object-cover transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={i === 0}
        />
      ))}

      {/* Overlay degradado sutil */}
      <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

      {/* Indicadores */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNER_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${
              i === current
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Ver imagen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

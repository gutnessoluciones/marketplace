"use client";

import { useState, useRef, useCallback } from "react";
import { Icon } from "@/components/icons";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const mainRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex] ?? null;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }, []);

  const goTo = (dir: -1 | 1) => {
    setActiveIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
    setShowZoom(false);
  };

  if (!images.length) {
    return (
      <div className="aspect-square bg-neutral-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-neutral-300">
        <Icon name="dress" className="w-20 h-20" />
        <span className="text-sm font-medium">Sin imágenes</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4">
        {/* Thumbnails – vertical strip on left (desktop) */}
        {images.length > 1 && (
          <div className="hidden md:flex flex-col gap-2 shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setActiveIndex(i);
                  setShowZoom(false);
                }}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all hover:opacity-100 ${
                  i === activeIndex
                    ? "border-flamencalia-red opacity-100 ring-2 ring-flamencalia-red/20"
                    : "border-neutral-200 opacity-60 hover:border-neutral-400"
                }`}
              >
                <img
                  src={img}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image container */}
        <div className="flex-1 relative">
          <div
            ref={mainRef}
            className="relative aspect-square bg-neutral-50 rounded-2xl overflow-hidden cursor-crosshair group"
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={activeImage!}
              alt={`${title} - Foto ${activeIndex + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* Lens indicator on the image – size matches 1/3 of image (backgroundSize 300%) */}
            {showZoom && (
              <div
                className="absolute border-2 border-flamencalia-albero/60 bg-flamencalia-albero/10 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100"
                style={{
                  width: "33.33%",
                  height: "33.33%",
                  left: `${zoomPos.x}%`,
                  top: `${zoomPos.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}

            {/* Zoom hint icon */}
            <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-neutral-500">
              <Icon name="search" className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">Zoom</span>
            </div>

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(-1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {activeIndex + 1} / {images.length}
              </div>
            )}

            {/* Dot indicators (mobile only) */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(i);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeIndex
                        ? "bg-white scale-125 shadow"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Zoomed panel – appears to the right on hover */}
          {showZoom && activeImage && (
            <div className="hidden lg:block absolute left-full top-0 ml-4 w-125 h-125 rounded-2xl overflow-hidden border border-neutral-200 shadow-xl bg-white z-20">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${activeImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: "scale(3)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile thumbnails – horizontal strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setShowZoom(false);
              }}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? "border-flamencalia-red opacity-100"
                  : "border-transparent opacity-50"
              }`}
            >
              <img
                src={img}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

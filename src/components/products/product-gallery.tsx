"use client";

import { useState, useRef, useCallback } from "react";
import { Icon } from "@/components/icons";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }, []);

  const activeImage = images[activeIndex] ?? null;

  const goTo = (dir: -1 | 1) => {
    setActiveIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
    setZoom(false);
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
      {/* Main image with zoom */}
      <div
        ref={imageRef}
        className="relative aspect-square bg-neutral-100 rounded-2xl overflow-hidden cursor-zoom-in group"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Base image */}
        <img
          src={activeImage!}
          alt={`${title} - Foto ${activeIndex + 1}`}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Zoom overlay */}
        {zoom && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundSize: "250%",
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundRepeat: "no-repeat",
            }}
          />
        )}

        {/* Magnifier cursor indicator */}
        {zoom && (
          <div
            className="absolute w-28 h-28 rounded-full border-2 border-white/60 shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `${zoomPos.x}%`,
              top: `${zoomPos.y}%`,
              transform: "translate(-50%, -50%)",
              backgroundImage: `url(${activeImage})`,
              backgroundSize: `${imageRef.current?.offsetWidth ? imageRef.current.offsetWidth * 3 : 2400}px`,
              backgroundPosition: `${-((zoomPos.x / 100) * (imageRef.current?.offsetWidth ?? 800) * 3 - 56)}px ${-((zoomPos.y / 100) * (imageRef.current?.offsetHeight ?? 800) * 3 - 56)}px`,
            }}
          />
        )}

        {/* Zoom icon */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Icon name="search" className="w-4 h-4 text-neutral-600" />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(-1);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(i);
                  setZoom(false);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeIndex
                    ? "bg-white scale-125 shadow"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setZoom(false);
              }}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all hover:opacity-100 ${
                i === activeIndex
                  ? "border-flamencalia-red opacity-100 ring-2 ring-flamencalia-red/20"
                  : "border-transparent opacity-60 hover:border-neutral-300"
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

"use client";

import { useState, useRef } from "react";
import { Icon } from "@/components/icons";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError("");
    setUploading(true);

    const newImages = [...images];

    for (const file of Array.from(files)) {
      if (newImages.length >= maxImages) {
        setError(`Máximo ${maxImages} imágenes`);
        break;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Error al subir imagen");
          continue;
        }
        newImages.push(data.url);
      } catch {
        setError("Error de conexión al subir imagen");
      }
    }

    onChange(newImages);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const newImages = [...images];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newImages.length) return;
    [newImages[index], newImages[newIndex]] = [
      newImages[newIndex],
      newImages[index],
    ];
    onChange(newImages);
  }

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative group aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50"
            >
              <img
                src={url}
                alt={`Imagen ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-flamencalia-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  Principal
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-neutral-700 hover:bg-neutral-100 text-xs"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
                {i < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-neutral-700 hover:bg-neutral-100 text-xs"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < maxImages && (
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-neutral-200 rounded-xl p-6 cursor-pointer hover:border-flamencalia-red hover:bg-flamencalia-red/5/50 transition-all group">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleUpload}
            className="sr-only"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex items-center gap-2 text-flamencalia-red">
              <svg
                className="w-5 h-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-sm font-medium">Subiendo...</span>
            </div>
          ) : (
            <>
              <Icon
                name="plus"
                className="w-5 h-5 text-neutral-400 group-hover:text-flamencalia-red transition-colors"
              />
              <span className="text-sm text-neutral-500 group-hover:text-flamencalia-red transition-colors">
                Añadir imágenes ({images.length}/{maxImages})
              </span>
            </>
          )}
        </label>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-neutral-400">
        JPG, PNG, WebP o GIF. Máximo 5MB por imagen.{" "}
        <strong>Mínimo 2 fotos obligatorias.</strong>
      </p>
    </div>
  );
}

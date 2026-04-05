import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { validateImageBytes } from "@/lib/validate-image";

// POST /api/upload — Upload product image to Supabase Storage
export async function POST(request: NextRequest) {
  const rl = rateLimit(request, "upload");
  if (rl) return rl;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return apiResponse({ error: "No file provided" }, 400);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return apiResponse(
        { error: "Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF." },
        400,
      );
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return apiResponse(
        { error: "El archivo es demasiado grande. Máximo 5MB." },
        400,
      );
    }

    // Validate actual file content (magic bytes)
    if (!(await validateImageBytes(file))) {
      return apiResponse({ error: "El archivo no es una imagen válida." }, 400);
    }

    const SAFE_EXTS: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = SAFE_EXTS[file.type] || "jpg";
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return apiResponse({ error: uploadError.message }, 500);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName);

    return apiResponse({ url: publicUrl }, 201);
  } catch (error) {
    return apiError(error);
  }
}

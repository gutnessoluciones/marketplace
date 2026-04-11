import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { validateImageBytes } from "@/lib/validate-image";

// POST /api/profile/banner — Upload banner image
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

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return apiResponse(
        { error: "Tipo de archivo no permitido. Usa JPG, PNG o WebP." },
        400,
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return apiResponse(
        { error: "El archivo es demasiado grande. Máximo 5MB." },
        400,
      );
    }

    if (!(await validateImageBytes(file))) {
      return apiResponse({ error: "El archivo no es una imagen válida." }, 400);
    }

    const SAFE_EXTS: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = SAFE_EXTS[file.type] || "jpg";
    const fileName = `${user.id}/banner.${ext}`;

    // Delete any previous banner files for this user
    const { data: existing } = await supabase.storage
      .from("banners")
      .list(user.id);

    if (existing && existing.length > 0) {
      await supabase.storage
        .from("banners")
        .remove(existing.map((f) => `${user.id}/${f.name}`));
    }

    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return apiResponse({ error: uploadError.message }, 500);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("banners").getPublicUrl(fileName);

    const bannerUrl = `${publicUrl}?t=${Date.now()}`;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ banner_url: bannerUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      return apiResponse({ error: updateError.message }, 500);
    }

    return apiResponse({ url: bannerUrl }, 201);
  } catch (error) {
    return apiError(error);
  }
}

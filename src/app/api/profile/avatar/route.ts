import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { validateImageBytes } from "@/lib/validate-image";

// POST /api/profile/avatar — Upload avatar image
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

    if (file.size > 2 * 1024 * 1024) {
      return apiResponse(
        { error: "El archivo es demasiado grande. Máximo 2MB." },
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
    };
    const ext = SAFE_EXTS[file.type] || "jpg";
    const fileName = `${user.id}/avatar.${ext}`;

    // Delete any previous avatar files for this user
    const { data: existing } = await supabase.storage
      .from("avatars")
      .list(user.id);

    if (existing && existing.length > 0) {
      await supabase.storage
        .from("avatars")
        .remove(existing.map((f) => `${user.id}/${f.name}`));
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return apiResponse({ error: uploadError.message }, 500);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    // Update profile with new avatar URL (add cache buster)
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      return apiResponse({ error: updateError.message }, 500);
    }

    return apiResponse({ url: avatarUrl }, 201);
  } catch (error) {
    return apiError(error);
  }
}

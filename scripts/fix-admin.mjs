import { createClient } from "@supabase/supabase-js";

const s = createClient(
  "https://hyolejmmvsizlceaslum.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5b2xlam1tdnNpemxjZWFzbHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQxNDMxMSwiZXhwIjoyMDkwOTkwMzExfQ.wlegjyC36y4DXLhVv79EdkQCf442W1ecevKevc-e9Zs",
);

const id = "31293f83-94f5-49e0-b837-388f03672325";

const { data: p } = await s.from("profiles").select("id").eq("id", id).single();
if (p) {
  const { error } = await s
    .from("profiles")
    .update({ role: "seller" })
    .eq("id", id);
  console.log("Rol actualizado:", error?.message ?? "✓");
} else {
  const { error } = await s
    .from("profiles")
    .insert({
      id,
      display_name: "systemflamencadmin-&",
      role: "seller",
      is_admin: true,
    });
  console.log("Profile recreado:", error?.message ?? "✓");
}

const { data: check } = await s
  .from("profiles")
  .select("id, display_name, role, is_admin")
  .eq("id", id)
  .single();
console.log("Perfil final:", check);

// Verify no more buyers
const { data: remaining } = await s
  .from("profiles")
  .select("id, display_name, role")
  .eq("role", "buyer");
console.log("Buyers restantes:", remaining?.length ?? 0, remaining);

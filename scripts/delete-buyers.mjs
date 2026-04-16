import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hyolejmmvsizlceaslum.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5b2xlam1tdnNpemxjZWFzbHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQxNDMxMSwiZXhwIjoyMDkwOTkwMzExfQ.wlegjyC36y4DXLhVv79EdkQCf442W1ecevKevc-e9Zs",
);

async function main() {
  // 1. Find all buyer profiles
  const { data: buyers, error } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("role", "buyer");

  if (error) {
    console.error("Error fetching buyers:", error.message);
    return;
  }

  if (!buyers || buyers.length === 0) {
    console.log("No hay perfiles con rol 'buyer'.");
    return;
  }

  console.log(`Encontrados ${buyers.length} perfiles con rol 'buyer':`);
  for (const b of buyers) {
    console.log(`  - ${b.display_name ?? "(sin nombre)"} (${b.id})`);
  }

  // 2. Delete each user from Auth (this cascades to profiles via trigger/FK)
  for (const buyer of buyers) {
    console.log(`Eliminando usuario ${buyer.display_name ?? buyer.id}...`);
    const { error: delError } = await supabase.auth.admin.deleteUser(buyer.id);
    if (delError) {
      console.error(`  Error: ${delError.message}`);
    } else {
      console.log(`  ✓ Eliminado`);
    }
  }

  console.log("\nHecho. Los usuarios con rol 'buyer' han sido eliminados.");
}

main();

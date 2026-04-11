import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hyolejmmvsizlceaslum.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5b2xlam1tdnNpemxjZWFzbHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQxNDMxMSwiZXhwIjoyMDkwOTkwMzExfQ.wlegjyC36y4DXLhVv79EdkQCf442W1ecevKevc-e9Zs"
);

async function main() {
  const PASSWORD = "Flm$X9k#Adm2026xPQz7";

  // Create user with role=buyer so trigger succeeds, then fix profile
  const { data, error } = await supabase.auth.admin.createUser({
    email: "systemflamencadmin@flamencalia.es",
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {
      display_name: "systemflamencadmin-&",
      role: "buyer",
    },
  });

  if (error) {
    console.error("Error creating user:", error.message);
    // Maybe already exists
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find(
      (u) => u.email === "systemflamencadmin@flamencalia.es"
    );
    if (existing) {
      console.log("User already exists:", existing.id);
      await supabase.auth.admin.updateUserById(existing.id, { password: PASSWORD });
      console.log("Password updated");
      await supabase.from("admin_users").upsert(
        { user_id: existing.id, role: "owner" },
        { onConflict: "user_id" }
      );
      console.log("Admin role set: owner");
    }
  } else {
    console.log("User created:", data.user.id);

    // Wait for trigger to create profile
    await new Promise((r) => setTimeout(r, 1500));

    // Add to admin_users as owner
    const { error: adminErr } = await supabase.from("admin_users").upsert(
      { user_id: data.user.id, role: "owner" },
      { onConflict: "user_id" }
    );
    if (adminErr) console.error("Admin error:", adminErr.message);
    else console.log("Admin role set: owner");
  }

  console.log("\n--- CREDENCIALES ADMIN ---");
  console.log("URL panel:  /flamencadmin-8x9k2m");
  console.log("Email:      systemflamencadmin@flamencalia.es");
  console.log("Password:   " + PASSWORD);
}

main();

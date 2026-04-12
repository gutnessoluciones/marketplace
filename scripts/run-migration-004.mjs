import fs from "fs";

const sql = fs.readFileSync(
  "./supabase/migrations/004_security_atomic_operations.sql",
  "utf8"
);

const SUPABASE_URL = "https://hyolejmmvsizlceaslum.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5b2xlam1tdnNpemxjZWFzbHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQxNDMxMSwiZXhwIjoyMDkwOTkwMzExfQ.wlegjyC36y4DXLhVv79EdkQCf442W1ecevKevc-e9Zs";

// Try the Supabase SQL API endpoint
const endpoints = [
  `${SUPABASE_URL}/pg/query`,
  `${SUPABASE_URL}/rest/v1/sql`,
];

for (const url of endpoints) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    console.log(`${url} => status: ${res.status}`);
    const txt = await res.text();
    console.log(txt.substring(0, 500));
    if (res.ok) {
      console.log("Migration executed successfully!");
      process.exit(0);
    }
  } catch (e) {
    console.log(`${url} => error: ${e.message}`);
  }
}

// Fallback: try Management API with Supabase personal token if available
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
if (accessToken) {
  const mgmtUrl = `https://api.supabase.com/v1/projects/hyolejmmvsizlceaslum/database/query`;
  const res = await fetch(mgmtUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  console.log("Management API status:", res.status);
  const txt = await res.text();
  console.log(txt.substring(0, 500));
} else {
  console.log("\nNo automated endpoint worked.");
  console.log("Please run the migration manually:");
  console.log("1. Go to https://supabase.com/dashboard/project/hyolejmmvsizlceaslum/sql");
  console.log("2. Paste the contents of supabase/migrations/004_security_atomic_operations.sql");
  console.log("3. Click 'Run'");
}

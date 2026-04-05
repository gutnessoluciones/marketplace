import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hyolejmmvsizlceaslum.supabase.co";
const SERVICE_KEY = "sb_secret_GXff_IR_BES9Q7Yp66XZ-Q_OgMIllHk";

const sql = fs.readFileSync(
  "./supabase/migrations/001_initial_schema.sql",
  "utf8",
);

// Try Management API
const projectRef = "hyolejmmvsizlceaslum";
const mgmtUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

const res = await fetch(mgmtUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ query: sql }),
});

console.log("Management API status:", res.status);
const text = await res.text();
console.log("Response:", text.substring(0, 500));

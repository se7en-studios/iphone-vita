import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Cargar .env.local sin librerías externas
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("❌ Faltan las variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.argv[3];

  if (!email || !password) {
    console.log("\nUso:");
    console.log("  npx tsx scripts/create-admin.ts <email> <password>\n");
    console.log("Ejemplo:");
    console.log("  npx tsx scripts/create-admin.ts admin@iphonevita.com MiClave123!\n");
    process.exit(1);
  }

  console.log(`\n⏳ Creando o actualizando usuario admin: ${email}...`);

  // 1. Crear o actualizar en Supabase Auth
  const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error("❌ Error listando usuarios:", listErr.message);
    process.exit(1);
  }

  const existing = usersData.users.find((u) => u.email?.toLowerCase() === email);

  if (existing) {
    console.log("ℹ️ El usuario ya existe en Auth. Actualizando contraseña...");
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (updateErr) {
      console.error("❌ Error actualizando contraseña:", updateErr.message);
      process.exit(1);
    }
  } else {
    const { error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) {
      console.error("❌ Error creando usuario en Auth:", createErr.message);
      process.exit(1);
    }
  }

  // 2. Dar de alta en public.admin_users con rol 'owner'
  const { error: dbErr } = await supabase.from("admin_users").upsert(
    {
      email,
      role: "owner",
      active: true,
    },
    { onConflict: "email" },
  );

  if (dbErr) {
    console.error("❌ Error insertando en tabla admin_users:", dbErr.message);
    process.exit(1);
  }

  console.log("✅ ¡Usuario administrador configurado con éxito!");
  console.log(`\nYa podés ingresar en /admin/login con:\n  Email: ${email}\n  Contraseña: ${password}\n`);
}

main();

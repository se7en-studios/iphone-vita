import type { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { handle } from "@/lib/api-guard";
import { rowToSettings, SETTINGS_TAG } from "@/lib/settings";
import { supabaseAdmin } from "@/lib/supabase";
import { validateSettings } from "@/lib/validation";

const COLUMNS = "ars_rate,announcement";

export async function GET() {
  return handle("GET settings", async () => {
    const { data, error } = await supabaseAdmin()
      .from("store_settings")
      .select(COLUMNS)
      .eq("id", "default")
      .single();
    if (error) throw new Error(error.message);
    return rowToSettings(data);
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return handle(
    "PUT settings",
    async () => {
      const s = validateSettings(body);
      const { data, error } = await supabaseAdmin()
        .from("store_settings")
        .upsert({
          id: "default",
          ars_rate: s.arsRate,
          announcement: s.announcement,
        })
        .select(COLUMNS)
        .single();
      if (error) throw new Error(error.message);
      revalidateTag(SETTINGS_TAG);
      revalidatePath("/", "layout");
      return rowToSettings(data);
    },
    { role: "owner" },
  );
}

import { unstable_cache } from "next/cache";
import type { StoreSettings } from "@/types";
import { DEFAULT_ARS_RATE } from "@/lib/format";
import { isSupabaseConfigured, supabasePublic } from "@/lib/supabase";

export const SETTINGS_TAG = "store-settings";
export const DEFAULT_SETTINGS: StoreSettings = {
  arsRate: DEFAULT_ARS_RATE,
  announcement: "",
};

interface SettingsRow {
  ars_rate: number | string;
  announcement: string | null;
}

export const rowToSettings = (r: SettingsRow): StoreSettings => ({
  arsRate: Number(r.ars_rate),
  announcement: r.announcement ?? "",
});

const fetchSettings = unstable_cache(
  async (): Promise<StoreSettings> => {
    const { data, error } = await supabasePublic()
      .from("store_settings")
      .select("ars_rate,announcement")
      .eq("id", "default")
      .maybeSingle();
    if (error)
      throw new Error(`No se pudo leer la configuración: ${error.message}`);
    return data ? rowToSettings(data) : DEFAULT_SETTINGS;
  },
  ["store-settings"],
  { tags: [SETTINGS_TAG], revalidate: 300 },
);

export async function getSettings(): Promise<StoreSettings> {
  return isSupabaseConfigured ? fetchSettings() : DEFAULT_SETTINGS;
}

import { LocalStorageAdapter } from "./local";
import { SupabaseAdapter } from "./supabase";
import type { StorageAdapter } from "./types";

export * from "./types";
export { LocalStorageAdapter } from "./local";
export { SupabaseAdapter } from "./supabase";
export { useCollection } from "./useCollection";

function createAdapter(): StorageAdapter {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (url && key) return new SupabaseAdapter(url, key);
  return new LocalStorageAdapter();
}

/** The app-wide adapter, chosen once from environment. */
export const storage: StorageAdapter = createAdapter();

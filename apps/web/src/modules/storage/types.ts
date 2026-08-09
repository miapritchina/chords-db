/**
 * All persistent app data goes through this interface. Implementations:
 *  - LocalStorageAdapter: zero-setup, browser-local (default)
 *  - SupabaseAdapter: cross-device sync, enabled via VITE_SUPABASE_* env vars
 *
 * The model is a document store: named collections of items with string ids.
 */
export interface Persisted {
  id: string;
}

export interface StorageAdapter {
  readonly kind: string;
  list<T extends Persisted>(collection: string): Promise<T[]>;
  put<T extends Persisted>(collection: string, item: T): Promise<void>;
  remove(collection: string, id: string): Promise<void>;
}

export function newId(): string {
  return crypto.randomUUID();
}

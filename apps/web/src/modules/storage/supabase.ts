import type { Persisted, StorageAdapter } from "./types";

/**
 * Supabase adapter speaking PostgREST directly — no SDK dependency.
 *
 * One-time setup in the Supabase SQL editor:
 *
 *   create table app_documents (
 *     collection text not null,
 *     id text not null,
 *     data jsonb not null,
 *     updated_at timestamptz not null default now(),
 *     primary key (collection, id)
 *   );
 *   alter table app_documents enable row level security;
 *   -- single-user hobby setup; tighten with auth policies when needed
 *   create policy "anon rw" on app_documents for all
 *     using (true) with check (true);
 *
 * Then set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in apps/web/.env.local.
 */
export class SupabaseAdapter implements StorageAdapter {
  readonly kind = "supabase";

  constructor(
    private url: string,
    private anonKey: string,
  ) {}

  private endpoint(query: string): string {
    return `${this.url}/rest/v1/app_documents?${query}`;
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return {
      apikey: this.anonKey,
      Authorization: `Bearer ${this.anonKey}`,
      "Content-Type": "application/json",
      ...extra,
    };
  }

  async list<T extends Persisted>(collection: string): Promise<T[]> {
    const res = await fetch(
      this.endpoint(`collection=eq.${encodeURIComponent(collection)}&select=data`),
      { headers: this.headers() },
    );
    if (!res.ok) throw new Error(`supabase list failed: ${res.status}`);
    const rows: { data: T }[] = await res.json();
    return rows.map((r) => r.data);
  }

  async put<T extends Persisted>(collection: string, item: T): Promise<void> {
    const res = await fetch(this.endpoint("on_conflict=collection,id"), {
      method: "POST",
      headers: this.headers({ Prefer: "resolution=merge-duplicates" }),
      body: JSON.stringify({
        collection,
        id: item.id,
        data: item,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) throw new Error(`supabase put failed: ${res.status}`);
  }

  async remove(collection: string, id: string): Promise<void> {
    const res = await fetch(
      this.endpoint(
        `collection=eq.${encodeURIComponent(collection)}&id=eq.${encodeURIComponent(id)}`,
      ),
      { method: "DELETE", headers: this.headers() },
    );
    if (!res.ok) throw new Error(`supabase remove failed: ${res.status}`);
  }
}

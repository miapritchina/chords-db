import type { Persisted, StorageAdapter } from "./types";

const PREFIX = "practice-studio/";

/** Browser localStorage adapter. Injectable store for tests. */
export class LocalStorageAdapter implements StorageAdapter {
  readonly kind = "local";

  constructor(
    private store: Pick<Storage, "getItem" | "setItem"> = globalThis.localStorage,
  ) {}

  private read<T extends Persisted>(collection: string): T[] {
    const raw = this.store.getItem(PREFIX + collection);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private write<T extends Persisted>(collection: string, items: T[]): void {
    this.store.setItem(PREFIX + collection, JSON.stringify(items));
  }

  async list<T extends Persisted>(collection: string): Promise<T[]> {
    return this.read(collection);
  }

  async put<T extends Persisted>(collection: string, item: T): Promise<void> {
    const items = this.read<T>(collection);
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    this.write(collection, items);
  }

  async remove(collection: string, id: string): Promise<void> {
    this.write(
      collection,
      this.read(collection).filter((i) => i.id !== id),
    );
  }
}

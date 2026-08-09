import { useCallback, useEffect, useState } from "react";
import { storage } from "./index";
import type { Persisted } from "./types";

/**
 * React binding for a storage collection: optimistic local state with
 * writes forwarded to the active adapter.
 */
export function useCollection<T extends Persisted>(collection: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    storage
      .list<T>(collection)
      .then((list) => {
        if (alive) setItems(list);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [collection]);

  const put = useCallback(
    (item: T) => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === item.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = item;
          return next;
        }
        return [...prev, item];
      });
      void storage.put(collection, item);
    },
    [collection],
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      void storage.remove(collection, id);
    },
    [collection],
  );

  return { items, loading, put, remove };
}

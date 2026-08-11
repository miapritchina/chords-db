import { useEffect, useRef, useState } from "react";
import { storage, type Persisted } from "@/modules/storage";
import type { MelodyCell } from "./types";

/**
 * The Melodies page's working state, persisted as a single document so a
 * sketch survives page reloads and instrument switches. Saves are
 * debounced; nothing writes until the stored state has been loaded.
 */
export interface Workbench extends Persisted {
  instrumentId: string;
  rootPc: number;
  scaleId: string;
  bpm: number;
  cells: MelodyCell[];
  /** Chosen harmony option index per segment (Composer). */
  chosen: number[];
}

const COLLECTION = "workbench";
const DOC_ID = "melody-workbench";

export function useWorkbench(defaults: Omit<Workbench, "id">) {
  const [state, setState] = useState<Workbench>({ id: DOC_ID, ...defaults });
  const [loaded, setLoaded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    storage
      .list<Workbench>(COLLECTION)
      .then((items) => {
        const doc = items.find((i) => i.id === DOC_ID);
        if (alive && doc) {
          setState((prev) => ({ ...prev, ...doc, id: DOC_ID }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void storage.put(COLLECTION, state);
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, loaded]);

  const patch = (
    p:
      | Partial<Omit<Workbench, "id">>
      | ((prev: Workbench) => Partial<Omit<Workbench, "id">>),
  ) =>
    setState((prev) => ({ ...prev, ...(typeof p === "function" ? p(prev) : p) }));

  return { state, patch, loaded };
}

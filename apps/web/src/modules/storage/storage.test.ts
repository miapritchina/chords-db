import { describe, expect, it } from "vitest";
import { LocalStorageAdapter } from "./local";

function memoryStore(): Pick<Storage, "getItem" | "setItem"> {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
  };
}

describe("LocalStorageAdapter", () => {
  it("puts, lists, updates and removes items", async () => {
    const adapter = new LocalStorageAdapter(memoryStore());
    await adapter.put("sessions", { id: "a", minutes: 20 });
    await adapter.put("sessions", { id: "b", minutes: 10 });
    expect(await adapter.list("sessions")).toHaveLength(2);

    await adapter.put("sessions", { id: "a", minutes: 45 });
    const items = await adapter.list<{ id: string; minutes: number }>("sessions");
    expect(items.find((i) => i.id === "a")?.minutes).toBe(45);

    await adapter.remove("sessions", "a");
    expect(await adapter.list("sessions")).toHaveLength(1);
  });

  it("isolates collections and survives corrupt payloads", async () => {
    const store = memoryStore();
    const adapter = new LocalStorageAdapter(store);
    await adapter.put("plans", { id: "p1" });
    expect(await adapter.list("sessions")).toHaveLength(0);

    store.setItem("practice-studio/plans", "{not json");
    expect(await adapter.list("plans")).toHaveLength(0);
  });
});

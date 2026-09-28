// Remembered canvas position/size per piece group ("category:groupName"),
// backed by /api/layouts (GitHub-as-database, same pattern as pieces) —
// shared across every device.

export type SavedLayout = { x: number; y: number; width: number; height: number };
export type LayoutMap = Record<string, SavedLayout>;

export async function getLayouts(secret: string): Promise<LayoutMap> {
  const res = await fetch("/api/layouts", { headers: { "x-admin-secret": secret } });
  if (!res.ok) throw new Error("Failed to load layouts");
  return res.json();
}

export async function saveLayout(secret: string, key: string, layout: SavedLayout): Promise<LayoutMap> {
  const res = await fetch("/api/layouts", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-secret": secret },
    body: JSON.stringify({ key, layout }),
  });
  if (!res.ok) throw new Error("Failed to save layout");
  return res.json();
}

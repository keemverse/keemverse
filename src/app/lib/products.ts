const API_URL =
  "https://script.google.com/macros/s/AKfycbxvRs-TgA3tqIMA7tBxvjs5pZ4j52cKyP3gYODzucUM1SU2rQ3OwSNxeqsZDNjRW8gc/exec";

export async function getProducts() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  return response.json();
}

export async function getPresets() {
  const response = await fetch(
    `${API_URL}?sheet=Lightroom%20Presets`
  );

  if (!response.ok) {
    throw new Error("Failed to load Lightroom presets");
  }

  return response.json();
}

export async function getMediaKit() {
  const response = await fetch(`${API_URL}?sheet=Media%20Kit`);

  if (!response.ok) {
    throw new Error("Failed to load media kit stats");
  }

  return response.json();
}

export async function getRateCard() {
  const response = await fetch(`${API_URL}?sheet=Rate%20Card`);

  if (!response.ok) {
    throw new Error("Failed to load rate card");
  }

  return response.json();
}

// New catalog backend (Supabase via /api/products) — replaces the Apps
// Script + Google Sheet functions above, one product type at a time. Not
// wired into any page yet: cut a page over only after its data has been
// migrated into the `products` table, so the site never reads an empty
// catalog. See docs/admin-products-setup.md for the migration step.
type CatalogType = "fashion_find" | "preset" | "design_bundle";

export async function getCatalogProducts(type: CatalogType) {
  const response = await fetch(`/api/products?type=${type}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${type} products`);
  }

  return response.json();
}